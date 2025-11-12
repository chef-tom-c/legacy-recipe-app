# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { seedSubscriptionTypes, getCustomerProfile, createCustomerProfile, listAvailableBadges } from '@dataconnect/generated';


// Operation SeedSubscriptionTypes: 
const { data } = await SeedSubscriptionTypes(dataConnect);

// Operation GetCustomerProfile: 
const { data } = await GetCustomerProfile(dataConnect);

// Operation CreateCustomerProfile: 
const { data } = await CreateCustomerProfile(dataConnect);

// Operation ListAvailableBadges: 
const { data } = await ListAvailableBadges(dataConnect);


```