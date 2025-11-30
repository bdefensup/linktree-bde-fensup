import { prisma } from "../lib/prisma";
import { faker } from "@faker-js/faker";

async function main() {
  console.warn("🌱 Start seeding events...");

  // Clean up existing events (optional, comment out if you want to keep them)
  // await prisma.event.deleteMany();

  const eventTypes = [
    "Soirée",
    "Voyage",
    "Sport",
    "Culture",
    "Afterwork",
    "Conférence",
    "Atelier",
    "Festival",
  ];

  const locations = [
    "Campus Fensup",
    "Bar Le QG",
    "Salle des Fêtes",
    "Stade Municipal",
    "Théâtre de la Ville",
    "Amphi A",
    "Parc Central",
  ];

  const events = [];

  // Helper to generate a date
  const generateDate = (
    scenario: "past" | "today" | "week" | "month" | "next_month" | "future"
  ) => {
    const today = new Date();
    switch (scenario) {
      case "past":
        return faker.date.recent({ days: 30 });
      case "today":
        return new Date();
      case "week":
        return faker.date.soon({ days: 7 });
      case "month":
        return faker.date.soon({ days: 30 }); // Roughly this month/next few weeks
      case "next_month":
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        return faker.date.between({
          from: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
          to: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0),
        });
      case "future":
        return faker.date.future();
      default:
        return new Date();
    }
  };

  // Generate 20 events
  for (let i = 0; i < 20; i++) {
    // Distribute dates to cover all filters
    let scenario: "past" | "today" | "week" | "month" | "next_month" | "future" = "future";
    if (i < 2) scenario = "past";
    else if (i < 3) scenario = "today";
    else if (i < 8)
      scenario = "week"; // More for "This Week"
    else if (i < 13)
      scenario = "month"; // More for "This Month"
    else if (i < 17) scenario = "next_month"; // More for "Next Month"

    const date = generateDate(scenario);
    const type = faker.helpers.arrayElement(eventTypes);
    const title = `${type} - ${faker.lorem.words(3)}`;

    // Prices
    const basePrice = parseFloat(faker.commerce.price({ min: 5, max: 50 }));
    const memberPrice = Math.floor(basePrice * 0.7); // 30% off for members
    const externalPrice = Math.ceil(basePrice * 1.2); // 20% more for externals

    events.push({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: faker.lorem.paragraph(),
      date: date,
      location: faker.helpers.arrayElement(locations),
      price: basePrice,
      memberPrice: memberPrice,
      externalPrice: externalPrice,
      maxSeats: faker.number.int({ min: 20, max: 200 }),
      image: `https://images.unsplash.com/photo-${faker.number.int({ min: 1500000000000, max: 1600000000000 })}?auto=format&fit=crop&w=800&q=80`, // Random Unsplash-like URL structure, or use specific IDs if needed.
      // Better to use specific keywords for better images if possible, but faker image url is deprecated or requires API key sometimes.
      // Let's use a reliable placeholder service or a fixed set of unsplash IDs if faker fails.
      // Actually, faker.image.urlLoremFlickr({ category: 'party' }) is good.
      // Let's stick to a simple randomizer or just null for now if we want to test the default image,
      // BUT user asked for "complete" events.
      // Let's use a generic image placeholder for now to be safe, or a few hardcoded nice ones.
      isFeatured: faker.datatype.boolean(),
    });
  }

  // Hardcoded images for better visual result
  const eventImages = [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", // Party
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14", // Concert
    "https://images.unsplash.com/photo-1514525253440-b393452e8d26", // DJ
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4", // Event
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94", // Student
  ];

  for (const event of events) {
    // Assign a random real image
    event.image = faker.helpers.arrayElement(eventImages);

    await prisma.event.create({
      data: event,
    });
  }

  console.warn(`✅ Added ${events.length} events!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
