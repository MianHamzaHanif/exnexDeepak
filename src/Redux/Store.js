// src/Redux/Store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./AuthSlice";
import dashboardReducer from "./DashboardSlice";
import web3Reducer from "./Web3Slice"; // ADD THIS
import storageSession from "redux-persist/lib/storage/session";
import { persistReducer, persistStore } from "redux-persist";

// Persist config - DON'T persist web3State (wallet should reconnect each session)
const persistConfig = {
  key: "root",
  storage: storageSession,
  whitelist: ["UserAuth", "dashboard"], // Only persist these, NOT web3State
};

const reducer = combineReducers({
  UserAuth: AuthSlice,
  dashboard: dashboardReducer,
  web3State: web3Reducer, // ADD THIS - not persisted for security
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true, // Changed to true for debugging (you can set to false in production)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST", 
          "persist/REHYDRATE",
          "web3State/connectWallet/fulfilled", // ADD THIS
        ],
        ignoredPaths: ["web3State"], // ADD THIS - Web3 objects aren't serializable
      },
    }),
});

export const persistor = persistStore(store);