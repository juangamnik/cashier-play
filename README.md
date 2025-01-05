# Cashier Play

A **simple yet professional toy** application that simulates a digital cash register using an Express.js backend and a vanilla JavaScript web app. This project was developed incrementally following agile principles, with Johannes Neubauer as the Product Owner and ChatGPT as the developer. It is not a real cash register and does not meet security requirements like TSE. Instead, it is a tool for experimentation and learning, designed to work with common peripherals like ESC/POS 80mm receipt printers and barcode scanners.

More details about the implementation can be found on [Johannes' blog](https://www.kingsware.de).

## Features

- **Client-Server Architecture**: The client (web app) interacts with the server for operations like handling purchases and printing receipts.
- **Peripheral Integration**: 
  - Compatible with 80mm ESC/POS receipt printers for professional receipt printing.
  - Use any standard barcode scanner for item input.
- **Web-based Interface**: Accessible from any device with a browser, enabling flexible setups in stores or restaurants.

## Limitations

- **Not a Real Cash Register**: This application is not compliant with legal requirements (e.g., TSE in Germany) and is intended solely for educational and experimental purposes.

## Prerequisites

- Node.js (16.x or later recommended)
- An ESC/POS 80mm receipt printer
- A barcode scanner
- A device with a modern web browser for client access

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cashier-play
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Connect your ESC/POS printer to the server device.

## Usage

1. **Start the Server**:
   - In development mode (with live reload):
     ```bash
     npm run dev
     ```
   - In production mode:
     ```bash
     npm start
     ```

2. **Access the Client**:
   - Open your web browser and navigate to the server's URL (e.g., `http://localhost:3000`).

3. **Simulate a Transaction**:
   - Use the web app to input items using a barcode scanner or manual entry.
   - Complete the purchase and send the receipt to the connected printer.

## Project Structure

- **`server.js`**: Main entry point for the Express server.
- **Backend**:
  - Handles item data and manages receipt generation.
  - Communicates with the printer for ESC/POS output.
- **Frontend**:
  - Vanilla JavaScript application served from the server.
  - Provides a user-friendly interface for managing transactions.

## Development

- Use `nodemon` for live-reloading during development:
  ```bash
  npm run dev
  ```

## Dependencies

- **Express.js**: Server framework.
- **SQLite3**: Lightweight database for storing transaction data.
- **Body-parser**: Middleware for handling JSON requests.
- **Express-fileupload**: For handling file uploads (if needed).
- **jsdom** and **puppeteer**: Useful for server-side DOM manipulations and testing.
- **serve-index**: For directory listing in development.

## License

This project is licensed under the [MIT License](LICENSE).

## Usage of the Application

The application operates in **three distinct modes**, each designed for specific tasks during the simulation of a transaction. The active mode is visually indicated by a **purple border** around the corresponding section of the user interface.

### Modes

1. **NUMPAD: Adding Items**
   - **Purpose**: Use this mode to manually enter items into the shopping list or transaction.
   - **How to Use**:
     - Enter the item's code or details using the on-screen numeric keypad or an attached barcode scanner.
     - Confirm the input to add the item to the current transaction.
   - **Visual Cue**: The NUMPAD section is highlighted with a purple border.

2. **SEARCH: Filtering the Item List**
   - **Purpose**: Quickly find specific items from the list by searching for their name or partial details.
   - **How to Use**:
     - Type the desired item name, code, or keyword into the search bar.
     - The item list will dynamically filter to display matching results.
     - Select an item to view or add it to the transaction.
   - **Visual Cue**: The SEARCH section is highlighted with a purple border.

3. **MENU: Choosing the Shop and Item List**
   - **Purpose**: Switch between different shops or scenarios (e.g., Restaurant, Discounter, Zoohandel) to load the appropriate item list.
   - **How to Use**:
     - Navigate to the MENU mode.
     - Select the desired shop type from the available options.
     - The item list and other settings will update based on the chosen shop scenario.
   - **Visual Cue**: The MENU section is highlighted with a purple border.

### Workflow Example

1. Start by selecting a **shop** in the **MENU** mode to load the relevant item list.
2. Switch to **NUMPAD** mode to add items to the transaction via manual entry or barcode scanner.
3. Use the **SEARCH** mode at any time to quickly locate specific items in the list.
4. Complete the transaction by finalizing the list, and print the receipt via the server.

### Notes

- Switching between modes is seamless and ensures efficient handling of transactions.
- The design ensures flexibility for various setups, whether in a retail store, restaurant, or other environments.

## User Interface Overview
<img width="1500" alt="main window" src="https://github.com/user-attachments/assets/9e70993f-2e56-414d-8784-eb76d949b9c7" />

The application’s interface is cleanly divided into three primary sections, each tailored to facilitate a smooth transaction workflow. The layout is intuitive and designed to provide quick access to all necessary features.

### Left: Numpad
- **Purpose**: Used for entering items into the receipt, either manually or via barcode scanning.
- **Details**:
  - Large, touch-friendly buttons for numeric input.
  - Action buttons at the bottom:
    - **Green**: Confirm the current entry.
    - **Red**: Clear the current input.
  - **Purple Border**: Indicates that the NUMPAD mode is active.

---

### Center: Receipt
- **Purpose**: Displays the ongoing transaction in a real-time simulated receipt format.
- **Details**:
  - Lists all items currently in the transaction, including their names, quantities, unit prices, and total cost.
  - Displays a summary at the bottom:
    - **Net Amount**: Total before tax.
    - **Tax Breakdown**: Amounts for each tax category.
    - **Gross Total**: Final total after tax.
  - Provides a clear preview of the printed receipt.

---

### Right: Item List
- **Purpose**: Shows the available items for the selected shop or business type.
- **Details**:
  - **Search Bar**: Quickly filter items by typing part of the name or code.
  - **Columns**:
    - **AN (Article Number)**: Unique identifier for each item.
    - **Description**: Name of the item.
    - **Price**: Price per unit.
    - **S (Tax Category)**: Indicates the applicable tax rate.
  - **Purple Border**: Indicates SEARCH mode when filtering items.

---

### Top-Left: Menu (Business Selection)
- **Purpose**: Switch between different business scenarios, such as a restaurant, supermarket, or pet store.
- **Details**:
  - Accessible via a hamburger menu icon.
  - Selecting a business updates the item list and receipt to match the context of that specific store type.
  - Ensures that the UI adapts to the selected shop's inventory and pricing.

---

This layout is optimized for usability, with clearly delineated sections and intuitive controls, ensuring a seamless experience during a transaction.

## Print View for Shops
<img width="1500" alt="Articles View" src="https://github.com/user-attachments/assets/d1ee24b3-854d-4a73-8edd-fd15b27ed8eb" />

The application provides a **dedicated print view** for each shop or business type, accessible under the route `business/<shop-name>`. This feature is designed to display a comprehensive, printer-friendly list of items available in the selected shop. The view is optimized for clarity and readability, making it ideal for physical distribution or for use during inventory management.

### Layout Description

1. **Header**:
   - The top of the page prominently displays the **shop name** (e.g., "Discounter").
   - A small ASCII representation of a receipt icon is included for visual context.

2. **Item Table**:
   - The main section features a structured table with the following columns:
     - **Item Number**: The unique identifier for each product. This is represented both as a number and as a scannable **barcode** for compatibility with barcode scanners.
     - **Name**: The product name, grouped under categories (e.g., "BAKERY") for better organization.
     - **Price**: The price per unit of the product, formatted in the local currency (e.g., EUR).
     - **Vat**: Indicates the applicable tax category (e.g., "B").

3. **Barcodes**:
   - Each item has a **barcode** directly beside its number, enabling easy scanning for adding items to transactions or for inventory purposes.

4. **Categories**:
   - Items are neatly grouped into logical categories (e.g., "BAKERY"), making it easier to locate specific products and reducing visual clutter.

### Accessing the Print View

- Navigate to the URL: `/business/<shop-name>` where `<shop-name>` corresponds to the selected business type (e.g., `/business/discounter`).
- The view is tailored for each shop, dynamically displaying its respective inventory.

### Use Case

- **Printing**: This page is optimized for printing, ensuring the table and barcodes are clearly legible on paper.
- **Inventory Management**: Provides a comprehensive overview of all available products in the shop.
- **Staff Reference**: Acts as a quick-reference guide for shop staff during sales or restocking operations.

### Notes

- The print view is not available for the "The Real Deal" business type, as it is meant for other purposes.
- Ensure the barcode scanner is configured to match the barcode format used in the print view for seamless operation.

## Article Management for "The Real Deal"
<img width="1456" alt="Article Management" src="https://github.com/user-attachments/assets/425f10d5-417d-4946-bf34-8a3c98f74968" />

The article management interface for the shop "The Real Deal" is a powerful tool for managing inventory. It allows users to add, edit, and delete articles stored in the backend database. The UI is cleanly divided into two sections for ease of use.

### UI Breakdown

#### 1. **Add / Edit Article Form (Top Section)**

- **Purpose**: Enables users to add a new article or update an existing one.
- **Fields**:
  - **DB ID**: Automatically generated and non-editable. It uniquely identifies the article in the database.
  - **Article Name**: Editable field for the name of the article (e.g., "Ginger Ale 1L").
  - **Article Number**: A unique identifier for the article, used for barcoding and inventory purposes.
  - **Price**: Editable field for the price of the article, formatted in the local currency (e.g., "0,89").
- **Action Buttons**:
  - **SAVE** (blue): Saves the current input to the database. Used for adding new articles or saving changes to existing ones.
  - **CANCEL** (red): Discards any unsaved changes and resets the form.

---

#### 2. **Article List Table (Bottom Section)**

- **Purpose**: Displays a real-time view of all articles currently stored in the database.
- **Columns**:
  - **DB ID**: The unique database identifier for the article.
  - **Article Number**: The unique number assigned to the article for barcoding.
  - **Name**: The name of the article (e.g., "Chips 200g").
  - **Price**: The price of the article in the local currency.
  - **Barcode**: A visual representation of the article number as a barcode, ready for scanning.
  - **Actions**:
    - **Edit (pencil icon)**: Opens the article in the "Add / Edit Article" form for modification.
    - **Delete (trash icon)**: Deletes the article from the database. A confirmation step may be required.

---

### Key Features

1. **Real-time Synchronization**:
   - Changes made via the form are immediately reflected in the article list below.
   - Ensures that the database stays up-to-date with minimal effort.

2. **Barcode Integration**:
   - Automatically generates a barcode for each article based on its article number.
   - Useful for testing and managing inventory with barcode scanners.

3. **Simple Navigation**:
   - Intuitive controls and layout make it easy to manage a large inventory.
   - Editing and deleting articles are straightforward with the action icons.

---

### Usage Workflow

1. To **add a new article**, fill in the "Article Name," "Article Number," and "Price" fields, then click **SAVE**.
2. To **edit an article**, click the **Edit (pencil)** icon in the table, make the desired changes in the form, and click **SAVE**.
3. To **delete an article**, click the **Delete (trash)** icon in the table and confirm the action if prompted.

This interface is specifically designed for "The Real Deal" shop and ensures seamless article management with database integration.

---

This application is a collaborative project between Johannes Neubauer and ChatGPT as the developer, aiming to combine technical experimentation with practical learning. For more insights, check out the blog at [Kingsware.de](https://www.kingsware.de). This README has been written by ChatGPT (under supervision of Johannes Neubauer)
