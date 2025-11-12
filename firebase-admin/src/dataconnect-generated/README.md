# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCustomerProfile*](#getcustomerprofile)
  - [*ListAvailableBadges*](#listavailablebadges)
- [**Mutations**](#mutations)
  - [*SeedSubscriptionTypes*](#seedsubscriptiontypes)
  - [*CreateCustomerProfile*](#createcustomerprofile)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCustomerProfile
You can execute the `GetCustomerProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCustomerProfile(): QueryPromise<GetCustomerProfileData, undefined>;

interface GetCustomerProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCustomerProfileData, undefined>;
}
export const getCustomerProfileRef: GetCustomerProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCustomerProfile(dc: DataConnect): QueryPromise<GetCustomerProfileData, undefined>;

interface GetCustomerProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetCustomerProfileData, undefined>;
}
export const getCustomerProfileRef: GetCustomerProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCustomerProfileRef:
```typescript
const name = getCustomerProfileRef.operationName;
console.log(name);
```

### Variables
The `GetCustomerProfile` query has no variables.
### Return Type
Recall that executing the `GetCustomerProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCustomerProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCustomerProfileData {
  customerProfile?: {
    id: UUIDString;
    createdAt: TimestampString;
    currentPoints: number;
    subscriptionType: string;
  } & CustomerProfile_Key;
}
```
### Using `GetCustomerProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCustomerProfile } from '@dataconnect/generated';


// Call the `getCustomerProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCustomerProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCustomerProfile(dataConnect);

console.log(data.customerProfile);

// Or, you can use the `Promise` API.
getCustomerProfile().then((response) => {
  const data = response.data;
  console.log(data.customerProfile);
});
```

### Using `GetCustomerProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCustomerProfileRef } from '@dataconnect/generated';


// Call the `getCustomerProfileRef()` function to get a reference to the query.
const ref = getCustomerProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCustomerProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.customerProfile);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.customerProfile);
});
```

## ListAvailableBadges
You can execute the `ListAvailableBadges` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAvailableBadges(): QueryPromise<ListAvailableBadgesData, undefined>;

interface ListAvailableBadgesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableBadgesData, undefined>;
}
export const listAvailableBadgesRef: ListAvailableBadgesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAvailableBadges(dc: DataConnect): QueryPromise<ListAvailableBadgesData, undefined>;

interface ListAvailableBadgesRef {
  ...
  (dc: DataConnect): QueryRef<ListAvailableBadgesData, undefined>;
}
export const listAvailableBadgesRef: ListAvailableBadgesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAvailableBadgesRef:
```typescript
const name = listAvailableBadgesRef.operationName;
console.log(name);
```

### Variables
The `ListAvailableBadges` query has no variables.
### Return Type
Recall that executing the `ListAvailableBadges` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAvailableBadgesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAvailableBadgesData {
  badges: ({
    id: UUIDString;
    name: string;
    description: string;
    imageUrl?: string | null;
    difficulty: string;
    pointsAwarded: number;
    requirements?: string | null;
  } & Badge_Key)[];
}
```
### Using `ListAvailableBadges`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAvailableBadges } from '@dataconnect/generated';


// Call the `listAvailableBadges()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAvailableBadges();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAvailableBadges(dataConnect);

console.log(data.badges);

// Or, you can use the `Promise` API.
listAvailableBadges().then((response) => {
  const data = response.data;
  console.log(data.badges);
});
```

### Using `ListAvailableBadges`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAvailableBadgesRef } from '@dataconnect/generated';


// Call the `listAvailableBadgesRef()` function to get a reference to the query.
const ref = listAvailableBadgesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAvailableBadgesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.badges);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.badges);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## SeedSubscriptionTypes
You can execute the `SeedSubscriptionTypes` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
seedSubscriptionTypes(): MutationPromise<SeedSubscriptionTypesData, undefined>;

interface SeedSubscriptionTypesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<SeedSubscriptionTypesData, undefined>;
}
export const seedSubscriptionTypesRef: SeedSubscriptionTypesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
seedSubscriptionTypes(dc: DataConnect): MutationPromise<SeedSubscriptionTypesData, undefined>;

interface SeedSubscriptionTypesRef {
  ...
  (dc: DataConnect): MutationRef<SeedSubscriptionTypesData, undefined>;
}
export const seedSubscriptionTypesRef: SeedSubscriptionTypesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the seedSubscriptionTypesRef:
```typescript
const name = seedSubscriptionTypesRef.operationName;
console.log(name);
```

### Variables
The `SeedSubscriptionTypes` mutation has no variables.
### Return Type
Recall that executing the `SeedSubscriptionTypes` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SeedSubscriptionTypesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SeedSubscriptionTypesData {
  basic: SubscriptionType_Key;
  pro: SubscriptionType_Key;
  enterprise: SubscriptionType_Key;
}
```
### Using `SeedSubscriptionTypes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, seedSubscriptionTypes } from '@dataconnect/generated';


// Call the `seedSubscriptionTypes()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await seedSubscriptionTypes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await seedSubscriptionTypes(dataConnect);

console.log(data.basic);
console.log(data.pro);
console.log(data.enterprise);

// Or, you can use the `Promise` API.
seedSubscriptionTypes().then((response) => {
  const data = response.data;
  console.log(data.basic);
  console.log(data.pro);
  console.log(data.enterprise);
});
```

### Using `SeedSubscriptionTypes`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, seedSubscriptionTypesRef } from '@dataconnect/generated';


// Call the `seedSubscriptionTypesRef()` function to get a reference to the mutation.
const ref = seedSubscriptionTypesRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = seedSubscriptionTypesRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.basic);
console.log(data.pro);
console.log(data.enterprise);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.basic);
  console.log(data.pro);
  console.log(data.enterprise);
});
```

## CreateCustomerProfile
You can execute the `CreateCustomerProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCustomerProfile(): MutationPromise<CreateCustomerProfileData, undefined>;

interface CreateCustomerProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCustomerProfileData, undefined>;
}
export const createCustomerProfileRef: CreateCustomerProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCustomerProfile(dc: DataConnect): MutationPromise<CreateCustomerProfileData, undefined>;

interface CreateCustomerProfileRef {
  ...
  (dc: DataConnect): MutationRef<CreateCustomerProfileData, undefined>;
}
export const createCustomerProfileRef: CreateCustomerProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCustomerProfileRef:
```typescript
const name = createCustomerProfileRef.operationName;
console.log(name);
```

### Variables
The `CreateCustomerProfile` mutation has no variables.
### Return Type
Recall that executing the `CreateCustomerProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCustomerProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCustomerProfileData {
  customerProfile_insert: CustomerProfile_Key;
}
```
### Using `CreateCustomerProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCustomerProfile } from '@dataconnect/generated';


// Call the `createCustomerProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCustomerProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCustomerProfile(dataConnect);

console.log(data.customerProfile_insert);

// Or, you can use the `Promise` API.
createCustomerProfile().then((response) => {
  const data = response.data;
  console.log(data.customerProfile_insert);
});
```

### Using `CreateCustomerProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCustomerProfileRef } from '@dataconnect/generated';


// Call the `createCustomerProfileRef()` function to get a reference to the mutation.
const ref = createCustomerProfileRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCustomerProfileRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.customerProfile_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.customerProfile_insert);
});
```

