
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { SubscriptionPlan, SubscriptionTier } from "../types";

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Little Artist',
    price: 0,
    familyPrice: 0,
    description: 'Perfect for trying out the magic.',
    features: [
      { text: '1 Color Page per Day', included: true }, 
      { text: 'Standard HD Quality', included: true },
      { text: 'Digital Coloring Studio', included: true },
      { text: 'Public Gallery Access', included: true },
      { text: 'PDF Downloads', included: false },
      { text: '4K Ultra-Resolution', included: false },
    ]
  },
  {
    id: 'pro',
    name: 'Creative Pro',
    price: 999, // $9.99
    familyPrice: 2999, // Increased to $29.99 to ensure margin safety with 4 users
    description: 'For the daily coloring enthusiast.',
    highlight: true,
    features: [
      { text: '12 Color Pages per Day', included: true }, // Adjusted to 12 (Safe cost ceiling ~ $14/mo)
      { text: '2K High Resolution', included: true },
      { text: 'Digital Coloring Studio', included: true },
      { text: 'Private Gallery Access', included: true },
      { text: 'Unlimited PDF Downloads', included: true },
      { text: 'Priority Generation', included: true },
    ]
  },
  {
    id: 'unlimited',
    name: 'Ultimate Magic',
    price: 2999, // Increased to $29.99 to cover heavy single-user usage
    familyPrice: 5999, // Increased to $59.99. Essential buffer against 4 kids generating 30 imgs/day.
    description: 'Maximum creativity for super fans.',
    features: [
      { text: '30 Color Pages per Day', included: true }, // Capped at 30 (Cost ceiling ~ $36/mo)
      { text: '4K Ultra-Resolution', included: true },
      { text: 'Digital Coloring Studio', included: true },
      { text: 'Private Gallery Access', included: true },
      { text: 'Exclusive Art Styles', included: true },
      { text: '24/7 Priority Support', included: true },
    ]
  }
];

export const upgradeSubscription = async (userId: string, planId: SubscriptionTier): Promise<void> => {
  // In a real app, this would trigger a Stripe Checkout session or API call.
  // We will simulate a successful payment and update the Firestore document directly.
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API latency

  const userRef = doc(db, "users", userId);
  
  await updateDoc(userRef, {
    subscriptionTier: planId,
    subscriptionStatus: 'active',
    lastBillingDate: Date.now()
  });
};

export const cancelSubscription = async (userId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const userRef = doc(db, "users", userId);
  
  // Downgrade to free immediately for demo purposes
  await updateDoc(userRef, {
    subscriptionTier: 'free',
    subscriptionStatus: 'active'
  });
};
