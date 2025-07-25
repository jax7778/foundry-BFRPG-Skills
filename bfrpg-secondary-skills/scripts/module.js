Hooks.once("ready", () => {
  console.log("BFRPG Secondary Skills Module Loaded");
});

Hooks.on("renderActorSheet", (app, html, data) => {
  // Placeholder for sheet injection logic
  console.log("Render actor sheet for skill injection");
});

function rollSkill(skillKey, actor) {
  const skill = actor.system.skills[skillKey];
  const ability = actor.system.abilities[skill.ability].mod;
  const roll = new Roll("1d20 + @mod + @bonus", {
    mod: ability,
    bonus: skill.bonus || 0
  });
  const TN = getTargetNumber(actor, skill);
  roll.roll({ async: true }).then(result => {
    result.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${skill.name} Skill Check (TN ${TN})`
    });
  });
}

function getTargetNumber(actor, skill) {
  if (!skill.isClassSkill && skill.type !== "general") return 20;
  return 17;
}