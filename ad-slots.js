(() => {
  const config = window.ANWAR_AD_CONFIG;
  const slots = document.querySelectorAll('[data-ad-slot]');
  if (!config || !config.placements) return;

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function initializeAdSlots() {
    slots.forEach((slot) => {
      const placement = config.placements[slot.dataset.adSlot];
      slot.replaceChildren();
      if (!placement || placement.enabled !== true) {
        slot.hidden = true;
        return;
      }

      slot.classList.add('ad-slot--active');
      slot.append(createTextElement('span', 'ad-slot-label', 'Advertisement'));
      const campaign = placement.campaign;
      let destinationIsSafe = false;
      try {
        destinationIsSafe = new URL(campaign?.destinationUrl).protocol === 'https:';
      } catch {
        destinationIsSafe = false;
      }

      if (campaign?.status === 'active' && destinationIsSafe && campaign.creativeText) {
        slot.hidden = false;
        if (campaign.advertiser) {
          slot.append(createTextElement('span', 'ad-slot-advertiser', campaign.advertiser));
        }
        const link = document.createElement('a');
        link.className = 'ad-slot-creative';
        link.href = campaign.destinationUrl;
        link.target = '_blank';
        link.rel = 'sponsored noopener noreferrer';
        if (campaign.id) link.dataset.campaignId = campaign.id;
        link.textContent = campaign.creativeText;
        slot.append(link);
        return;
      }

      if (placement.fallback === true) {
        slot.hidden = false;
        slot.append(createTextElement('p', 'ad-slot-fallback', 'No advertisement is currently available.'));
      } else {
        slot.hidden = true;
      }
    });
  }

  window.initializeAnwarAdSlots = initializeAdSlots;
  initializeAdSlots();
})();
