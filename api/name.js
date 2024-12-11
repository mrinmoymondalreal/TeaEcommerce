import { faker } from "@faker-js/faker";
import fs from "fs";
import { join } from "path";

let g = `Himalayan Bliss
"Experience the serene flavors of the Himalayas in every calming sip."

Darjeeling Dusk
"A cup of aromatic luxury with the golden hues of Darjeeling’s finest."

Assam Awakening
"Bold, malty notes to invigorate your mornings with Assam’s best."

Mountain Mist
"Delicate leaves kissed by the mists of the Himalayas for a refreshing brew."

Golden Glow
"Harvested from Darjeeling’s rolling hills, this tea exudes elegance in every sip."

Sunrise Chai
"A bright, robust blend inspired by Assam’s vibrant sunrises."

Mystic Leaf
"Uncover the secrets of Himalayan tea with every enchanting sip."

Everest Elixir
"A bold, invigorating blend from the heart of the Himalayas."

Darjeeling Delight
"Savor the subtle, floral charm of Darjeeling’s premium tea leaves."

Assam Royale
"Majestic and malty, a true taste of Assam’s finest tradition."

Himalayan Harmony
"A balanced blend of mountain-fresh flavors for a tranquil tea time."

Chai of Legends
"Inspired by the timeless flavors of Darjeeling and Assam."

Peak Perfection
"Tea crafted to perfection from the lofty Himalayan peaks."

Valley Verdure
"The lush valleys of Darjeeling bring nature’s finest to your cup."

Assam Noir
"A rich, full-bodied tea with the bold character of Assam."

Zen Sip
"A soothing brew to bring balance, from the serene Himalayas."`;

const productLength = g.split("\n\n").length,
  userLength = 40;

let products_sql =
  "INSERT INTO products (title, description, price, stock, image_urls, variant) VALUES \n";

let images = [
  "hlirkI2SZcT7Qao1gS40p_jrh5vf",
  "GYch9L2PUIuM6pZoQepyQ_dbpmvy",
  "ryaGiN4kzRxm9cm9xTKgW_yykzlc",
  "fotor-ai-202412111120_hqvepx",
  "fotor-ai-202412111122_zhwvvj",
  "fotor-ai-202412111124_bwv2ew",
  "fotor-ai-202412111127_vqifeb",
];

const banner =
  "https://res.cloudinary.com/dcv8xqpku/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1733904057/";
const thumbnail =
  "https://res.cloudinary.com/dcv8xqpku/image/upload/c_thumb,w_200,g_face/v1733904057/";

images = images.map((e) => [`'${banner}${e}'`, `'${thumbnail}${e}'`]);

products_sql += g
  .split("\n\n")
  .map((e) => {
    const [title, description] = e.split("\n");

    return `('${title}', '${description}', '${(Math.random() * 3000).toFixed(2)}', '${Math.floor(Math.random() * 200)}', ARRAY [${images[Math.floor(Math.random() * images.length)].join(",")}],'100,200,300')`;
  })
  .join(", \n");
products_sql += ";";

let user_sql = "INSERT INTO users (name, email) VALUES \n";
user_sql += new Array(userLength)
  .fill(0)
  .map(() => {
    return `('${faker.person.fullName()}', '${faker.internet.email()}')`;
  })
  .join(",\n");
user_sql += ";";

let ratings_sql = "INSERT INTO ratings (product_id, user_id, rating) VALUES \n";
const offsetProductId = 0,
  offsetUserId = 0;
ratings_sql += new Array(200)
  .fill(0)
  .map((e) => {
    return `('${Math.floor(Math.random() * productLength) + 1 + offsetProductId}', '${Math.floor(Math.random() * userLength) + 1 + offsetUserId}', '${Math.floor(Math.random() * 5) + 1}')`;
  })
  .join(",\n");
ratings_sql += ";";

let final_sql =
  products_sql + "\n\n" + user_sql + "\n\n" + ratings_sql + "\n\n";

const filename = join(process.cwd(), "server/row.sql");
fs.writeFile(filename, final_sql, console.log);
