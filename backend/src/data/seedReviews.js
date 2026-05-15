cforconst daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const restaurantSeed = [
  { source: 'google', author: 'Rhea Kapoor', content: 'Loved the food quality and ambience. Service was fast and warm. Will definitely come back!', rating: 5, reviewedAt: daysAgo(1) },
  { source: 'zomato', author: 'Aman Verma', content: 'Waited 35 minutes for the main course even on a weekday. Taste was decent but the delay was very frustrating.', rating: 2, reviewedAt: daysAgo(2) },
  { source: 'tripadvisor', author: 'Priya Nair', content: 'Excellent starters and lovely ambience, but portions are small for the price they charge.', rating: 4, reviewedAt: daysAgo(4) },
  { source: 'instagram', author: 'foodie.ankit', content: 'Looks great on Instagram but hygiene near the wash area and the kitchen entrance needs serious improvement.', rating: 2, reviewedAt: daysAgo(5) },
  { source: 'reddit', author: 'mumbai_diner', content: 'Weekend service is absurdly slow. Took 1 hour for the main course. Staff is polite but clearly understaffed.', rating: 2, reviewedAt: daysAgo(6) },
  { source: 'google', author: 'Neha S.', content: 'Fantastic meal every time I visit. The chef specials are entirely worth it. Top notch food quality!', rating: 5, reviewedAt: daysAgo(8) },
  { source: 'zomato', author: 'Kunal Mehta', content: 'Pricing is a bit steep. The portions do not justify what you pay. Ambience is nice though.', rating: 3, reviewedAt: daysAgo(9) },
  { source: 'google', author: 'Sonal Joshi', content: 'Came for a birthday dinner. The staff was so attentive and made the evening truly special. Food was outstanding.', rating: 5, reviewedAt: daysAgo(11) },
  { source: 'tripadvisor', author: 'Rohan D.', content: 'The food quality has gone down compared to last year. More expensive and smaller portions. Disappointing visit.', rating: 2, reviewedAt: daysAgo(13) },
  { source: 'google', author: 'Fatima K.', content: 'Best pasta I have had in this city. The ambience is romantic and staff are knowledgeable about the menu.', rating: 5, reviewedAt: daysAgo(15) },
  { source: 'reddit', author: 'local_eater', content: 'Hygiene standards are concerning. Spotted unclean utensils twice. Will not be returning until things improve.', rating: 1, reviewedAt: daysAgo(17) },
  { source: 'zomato', author: 'Preethi R.', content: 'Ordered online and the delivery was late by 40 minutes. Food arrived cold. Service needs a major overhaul.', rating: 2, reviewedAt: daysAgo(18) },
  { source: 'instagram', author: 'dine.with.shweta', content: 'Absolutely beautiful presentation and quality. The dessert tray alone is Instagram-worthy. Highly recommend.', rating: 5, reviewedAt: daysAgo(20) },
  { source: 'google', author: 'Arjun T.', content: 'Waited almost 50 minutes on a quiet Tuesday evening. No apology from the staff about the wait time.', rating: 2, reviewedAt: daysAgo(22) },
  { source: 'tripadvisor', author: 'Meera V.', content: 'Very average experience overall. Nothing special about the food. Service was okay. Probably will not return.', rating: 3, reviewedAt: daysAgo(24) }
];

const hotelSeed = [
  { source: 'google', author: 'Vikram Shah', content: 'Very clean room and excellent breakfast spread. The housekeeping was prompt and staff were genuinely helpful.', rating: 5, reviewedAt: daysAgo(1) },
  { source: 'tripadvisor', author: 'M. Dsouza', content: 'Check-in was smooth but wifi was unreliable at night. Could not join work calls from the room.', rating: 3, reviewedAt: daysAgo(2) },
  { source: 'other', author: 'Booking Guest', content: 'Great location and courteous staff. Gym equipment looks dated and the pool closes too early at 8pm.', rating: 4, reviewedAt: daysAgo(3) },
  { source: 'google', author: 'Sarah K', content: 'Housekeeping missed our room on day 2. Called reception twice and nobody came. Service was very poor.', rating: 2, reviewedAt: daysAgo(4) },
  { source: 'instagram', author: 'travel.with.joy', content: 'Beautiful property and the most helpful concierge I have encountered. Highly recommend for couples.', rating: 5, reviewedAt: daysAgo(7) },
  { source: 'tripadvisor', author: 'James P.', content: 'AC unit in our room was noisy throughout the night. Could barely sleep. Maintenance needs attention.', rating: 2, reviewedAt: daysAgo(9) },
  { source: 'google', author: 'Nalini R.', content: 'Perfect stay for our anniversary. Room was immaculate, breakfast was fresh, and staff exceeded all expectations.', rating: 5, reviewedAt: daysAgo(11) },
  { source: 'other', author: 'Corporate Traveler', content: 'Wifi consistently dropped during video calls. For a business hotel this is unacceptable. Fix the network.', rating: 2, reviewedAt: daysAgo(13) },
  { source: 'google', author: 'Dr. Abhay M.', content: 'Excellent location near the airport. Room was quiet and the bed was very comfortable. Will stay again.', rating: 5, reviewedAt: daysAgo(15) },
  { source: 'tripadvisor', author: 'K. Williams', content: 'Overpriced for what you get. The restaurant inside the hotel is expensive and mediocre. Much better options nearby.', rating: 2, reviewedAt: daysAgo(17) },
  { source: 'instagram', author: 'bag.and.board', content: 'The rooftop pool view is stunning! Breakfast selection is incredible. Staff makes you feel genuinely welcome.', rating: 5, reviewedAt: daysAgo(19) },
  { source: 'google', author: 'Omar F.', content: 'Clean comfortable room but the walls are quite thin. Heard everything from the next room at night.', rating: 3, reviewedAt: daysAgo(21) }
];

function getSeedReviews(type) {
  return type === 'hotel' ? hotelSeed : restaurantSeed;
}

module.exports = { getSeedReviews };

