We want a simple inventory and simple accounting (actually more like a "split bills" application) for the brewers of our micro brewery. The interface to should be an android app. The system should support multiple users. There should be some backend on the internet. From that backend, the inventory part should also be publicly available on a website.
The products I want are:
- Android app to manage accounting and inventory
- An online backend
- A website, able to display parts of the inventory
I think it would make sense, that these live in different repositories. But you can decide. 

**The Accounting part:**
We do not have a bank account for our micro brewery. So every payment and every income goes to/from a personal account. That's why we would like to implement our accounting solution like a "split bills" application (e.g.: Splid, Splitwise). The Brewers shall be configurable through the android app and synced to the backend. 
We should be able to register payments and incomes for our individual Brewer accounts. Then, there should be a tracking of how owes how much to whom to break even.

**The Inventory part:**
We want to manage our Bottles and Kegs with our inventory solution. The available container types (0.5l Bottles, 2l Bottles, 10l Kegs....) shall be configurable through the android app and synced to the backend. They also should have icons, and a state which beer is in it, or if they are empty. Then they need to have a location, which again need to be configurable. Sample locations (At Brewer A, At Brewer B, in the Brewery, At Customer, Customer returned Container to Brewer A, ... )
We should be able from the android app to easily add, move from location to location and change filling in the app, as well as delete a container (bottle breaks...). Other inventory options are:
- **Beer destroyed** is for the case that a beer went bad. The container just gets reclassified as empty. 
- The "Batch fill" option is for brew days, when we fill several containers with the same new beer. reclassifying them from empty to the new beer
- Then there needs to be a "reserved" flag, which flags a full bottle as reserved from a specific customer.

**Interactions of the two:**
We need a "Sell" a "Self Consumption" a "Container Returned from customer"  option in the App. These require prices (an internal and an external one as well as a depot fee) which are connected to the container types. these will work as follows:
- Brewer A **sells** a Container (2l Flasche) to a Customer: The Container (2l Flasche) with Filling (Brown Ale) is moved in the Inventory from "At Brewer A" to "At Customer". Simultaneously the external prize and depot fee for the Container get added to the account of Brewer A.
- Brewer A gets **Container Returned** from a customer: The container depot fee gets subtracted from the account of Brewer A and the Container is classified as empty and moved from "At Customer" to a location of choice.
- Brewer B logs **Self Consumption** of a container. The internal prize is deducted from Brewer B's account and the container is classified as empty.  

**On the Website** there should be an inventory view, which shows which Beers, in which containers are available and not reserved. Optionally (we define in the backend), the location can be shown as well.
