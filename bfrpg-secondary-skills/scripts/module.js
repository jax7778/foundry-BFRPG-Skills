Hooks.once("ready", () => {
  console.log("BFRPG Secondary Skills Module Loaded");
});

Hooks.on("renderActorSheet", (app, html, data) => {
  const actor = app.actor;
  const skills = getProperty(actor.system, "skills") || {};
  const container = $(`<div class="bfrpg-skills">
    <h3>Secondary Skills</h3>
  </div>`);

  for (const [key, skill] of Object.entries(skills)) {
    const mod = actor.system.abilities[skill.ability]?.mod ?? 0;
    const btn = $(`<button data-skill="${key}">🎲</button>`);
    btn.on("click", () => rollSkill(key, actor));
    const row = $(`<div class="skill-row">
      <span><strong>${skill.name}</strong> (Lvl ${skill.level}) — ${skill.ability.toUpperCase()} (${mod >= 0 ? "+" : ""}${mod})</span>
    </div>`);
    row.append(btn);
    container.append(row);
  }

  html.find(".sheet-body").append(container);
});

function rollSkill(skillKey, actor) {
  const skill = actor.system.skills?.[skillKey];
  if (!skill) return ui.notifications.warn(`Skill '${skillKey}' not found.`);

  const abilityMod = actor.system.abilities[skill.ability]?.mod || 0;
  const levelBonus = skill.level || 0;
  const backgroundBonus = skill.fromBackground ? 1 : 0;
  const TN = getTargetNumber(skill);

  const roll = new Roll("1d20 + @mod + @level + @bg", {
    mod: abilityMod,
    level: levelBonus,
    bg: backgroundBonus
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
