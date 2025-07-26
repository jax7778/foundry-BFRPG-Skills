Hooks.once("ready", () => {
  console.log("BFRPG Secondary Skills Module Loaded");
});

Hooks.on("renderActorSheet", (app, html, data) => {
  const actor = app.actor;

  // Retrieve stored secondary skills
  const skills = getActorSkills(actor);
  if (!skills || Object.keys(skills).length === 0) return;

  // Create the new tab navigation item
  const navTab = $(`<a class="item" data-tab="bfrpg-secondary-skills">Secondary Skills</a>`);
  html.find('.sheet-navigation .item:last').after(navTab);

  // Create the new tab content panel
  const panel = $(`
    <div class="tab" data-tab="bfrpg-secondary-skills">
      <h3>Secondary Skills</h3>
      <ul class="bfrpg-skill-list">
        ${Object.entries(skills).map(([key, skill]) => `
          <li class="bfrpg-skill-item">
            <strong>${skill.name}</strong> (${skill.ability.toUpperCase()}) 
            <button type="button" data-skill="${key}" class="bfrpg-roll-skill">🎲 Roll</button>
          </li>
        `).join("")}
      </ul>
    </div>
  `);

  html.find('.sheet-body').append(panel);

  // Event handler for rolling skills
  html.find('.bfrpg-roll-skill').on('click', event => {
    const skillKey = event.currentTarget.dataset.skill;
    rollSkill(skillKey, actor);
  });
});

function getActorSkills(actor) {
  return foundry.utils.getProperty(actor, 'flags.bfrpg-secondary-skills.skills') || {};
}

function rollSkill(skillKey, actor) {
  const skills = getActorSkills(actor);
  const skill = skills[skillKey];
  if (!skill) return ui.notifications.warn("Skill not found!");

  const abilityMod = actor.system.abilities?.[skill.ability]?.mod || 0;
  const bonus = skill.bonus || 0;
  const TN = getTargetNumber(skill);

  const roll = new Roll("1d20 + @mod + @bonus", {
    mod: abilityMod,
    bonus: bonus
  });

  roll.roll({ async: true }).then(result => {
    result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${skill.name} Skill Check (TN ${TN})`
    });
  });
}

function getTargetNumber(skill) {
  if (!skill.isClassSkill && skill.type !== "general") return 20;
  return 17;
}
