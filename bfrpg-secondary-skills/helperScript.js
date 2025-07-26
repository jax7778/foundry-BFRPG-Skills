// 🔧 CONFIGURATION: Edit this if needed
const SKILL_JSON_URL = "https://yourdomain.com/data/skills.json"; // change to your actual hosted path
const COMPENDIUM_NAME = "bfrpg-secondary-skills.skills"; // match your module and pack name

async function importSkillsToCompendium() {
  const pack = game.packs.get(COMPENDIUM_NAME);
  if (!pack) return ui.notifications.error("Compendium not found.");

  // Load skills.json from URL
  const response = await fetch(SKILL_JSON_URL);
  const skillsData = await response.json();

  const skillItems = Object.entries(skillsData).map(([key, skill]) => {
    return {
      name: skill.name,
      type: "loot", // adjust type if needed
      flags: {
        "bfrpg-secondary-skills": {
          skillKey: key,
          skillData: skill
        }
      },
      system: {}, // Can be empty for non-mechanical skills
      img: "icons/skills/melee/sword-stroke-red.webp" // Optional placeholder image
    };
  });

  // Create and import items
  for (let itemData of skillItems) {
    const item = await Item.create(itemData, { temporary: true });
    await pack.importDocument(item);
  }

  ui.notifications.info(`Imported ${skillItems.length} skills to compendium.`);
}

importSkillsToCompendium();
