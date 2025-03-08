/**
 * Utils for handling specialization data and icons
 */

// Define specialization icon types
export type SpecializationIconType = 
  | "grooming"
  | "puppy"
  | "breed"
  | "medical"
  | "mobile"
  | "styling"
  | "sensitive"
  | "spa"
  | "default";

/**
 * Get the appropriate icon type based on specialization name
 */
export function getSpecializationIconType(name: string): SpecializationIconType {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("puppy") || nameLower.includes("young")) {
    return "puppy";
  }
  
  if (nameLower.includes("breed") || nameLower.includes("specific") || 
      nameLower.includes("poodle") || nameLower.includes("terrier")) {
    return "breed";
  }
  
  if (nameLower.includes("medic") || nameLower.includes("health") || 
      nameLower.includes("skin") || nameLower.includes("allerg") || 
      nameLower.includes("condition")) {
    return "medical";
  }
  
  if (nameLower.includes("mobile") || nameLower.includes("home")) {
    return "mobile";
  }
  
  if (nameLower.includes("style") || nameLower.includes("cut") || 
      nameLower.includes("fashion") || nameLower.includes("show")) {
    return "styling";
  }
  
  if (nameLower.includes("sensitive") || nameLower.includes("nervous") || 
      nameLower.includes("anxious") || nameLower.includes("gentle")) {
    return "sensitive";
  }
  
  if (nameLower.includes("spa") || nameLower.includes("massage") || 
      nameLower.includes("relax") || nameLower.includes("luxury")) {
    return "spa";
  }
  
  if (nameLower.includes("groom") || nameLower.includes("basic") || 
      nameLower.includes("standard")) {
    return "grooming";
  }
  
  return "default";
}

/**
 * Get a gradient background color based on specialization type
 */
export function getSpecializationGradient(type: SpecializationIconType): string {
  switch (type) {
    case "puppy":
      return "from-blue-100 to-indigo-100";
    case "breed":
      return "from-green-100 to-emerald-100";
    case "medical":
      return "from-red-100 to-rose-100";
    case "mobile":
      return "from-amber-100 to-yellow-100";
    case "styling":
      return "from-purple-100 to-violet-100";
    case "sensitive":
      return "from-pink-100 to-fuchsia-100";
    case "spa":
      return "from-teal-100 to-cyan-100";
    case "grooming":
      return "from-blue-100 to-sky-100";
    default:
      return "from-gray-100 to-slate-100";
  }
}

/**
 * Generate a fallback description for a specialization if none is provided
 */
export function generateFallbackDescription(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes("puppy") || nameLower.includes("young")) {
    return `Gentle grooming services specially designed for puppies and young dogs. Our groomers are trained to make their first grooming experiences positive and stress-free.`;
  }
  
  if (nameLower.includes("breed")) {
    return `Specialized grooming techniques tailored to the specific needs of different dog breeds. Our groomers understand the unique requirements for each breed's coat type and style.`;
  }
  
  if (nameLower.includes("medic") || nameLower.includes("health") || nameLower.includes("skin")) {
    return `Special care for dogs with medical conditions, skin problems, or allergies. Our groomers work with gentle products and techniques suited for sensitive skin.`;
  }
  
  if (nameLower.includes("mobile") || nameLower.includes("home")) {
    return `Convenient grooming services brought directly to your doorstep. Ideal for busy owners or dogs that get stressed during travel.`;
  }
  
  if (nameLower.includes("style") || nameLower.includes("cut")) {
    return `Creative styling and custom cuts to make your dog stand out. From show cuts to fashion-forward styles, our groomers can create the perfect look.`;
  }
  
  if (nameLower.includes("sensitive") || nameLower.includes("nervous")) {
    return `Specialized handling for anxious, nervous, or sensitive dogs. Our patient groomers create a calm environment and use gentle techniques for a stress-free experience.`;
  }
  
  if (nameLower.includes("spa")) {
    return `Pamper your pet with our luxurious spa treatments. Including massages, aromatic baths, and conditioning treatments for a truly relaxing experience.`;
  }
  
  return `Professional ${name.toLowerCase()} services for dogs of all breeds and sizes. Our expert groomers ensure your pet looks and feels their best.`;
}

/**
 * Map of icon data for each specialization type
 */
export const specializationIconData: Record<SpecializationIconType, { viewBox: string, path: string[], color: string }> = {
  puppy: {
    viewBox: "0 0 24 24",
    color: "text-indigo-500",
    path: [
      "M10 5.172C10 3.172 8.5 2.172 7 2.172C5.5 2.172 4 3.172 4 5.172C4 7.172 2 9.172 2 9.172H7C7 9.172 10 7.172 10 5.172Z",
      "M17 5.172C17 3.172 18.5 2.172 20 2.172C21.5 2.172 23 3.172 23 5.172C23 7.172 25 9.172 25 9.172H20C20 9.172 17 7.172 17 5.172Z",
      "M12.5 22.172C16.642 22.172 20 18.814 20 14.672C20 10.53 16.642 7.172 12.5 7.172C8.358 7.172 5 10.53 5 14.672C5 18.814 8.358 22.172 12.5 22.172Z",
      "M12 10.172C12 10.172 13 11.172 15 11.172C17 11.172 18 10.172 18 10.172"
    ]
  },
  breed: {
    viewBox: "0 0 24 24",
    color: "text-emerald-500",
    path: [
      "M9 11V8a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1V6a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v5",
      "M19 11h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-8",
      "M5 11h3",
      "M8 11v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h4Z",
      "m2 22 3-3",
      "M19 22v-8.5a3.5 3.5 0 0 0-7 0V22"
    ]
  },
  medical: {
    viewBox: "0 0 24 24",
    color: "text-rose-500",
    path: [
      "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-4-3.85-6-2 0 0 2 1 2 3 0 1-1 2-1 2",
      "M14.5 17.5A2.5 2.5 0 0 0 17 15c0-1.38-.5-2-1-3-1.072-2.143-4-3.85-6-2 0 0 2 1 2 3 0 1-1 2-1 2",
      "M8.5 8.5A2.5 2.5 0 0 1 11 11c0-1.38.5-2 1-3 1.072-2.143 4-3.85 6-2 0 0-2 1-2 3 0 1 1 2 1 2",
      "M14.5 11.5A2.5 2.5 0 0 1 17 14c0-1.38.5-2 1-3 1.072-2.143 4-3.85 6-2 0 0-2 1-2 3 0 1 1 2 1 2"
    ]
  },
  mobile: {
    viewBox: "0 0 24 24",
    color: "text-yellow-500",
    path: [
      "M19 17h2l.64-2.54a6 6 0 0 0 0-2.92L21 9h-2M3 17h2l.64-2.54a6 6 0 0 0 0-2.92L5 9H3M14 21l-2-2 2-2M10 21l2-2-2-2",
      "M8 17h8M16 3H8l-4 6v4h16v-4l-2-3M16 3l-2 6M8 3l2 6",
      "M9 9h6"
    ]
  },
  styling: {
    viewBox: "0 0 24 24",
    color: "text-violet-500",
    path: [
      "M9 6v12",
      "M9 10h4.5a2.5 2.5 0 0 0 0-5H9v5z",
      "M9 15h5a2.5 2.5 0 0 1 0 5H9v-5z",
      "M15 9.1c1.1.1 1.9 1 1.9 2.1M17 12.1c1.1.1 1.9 1 1.9 2.1"
    ]
  },
  sensitive: {
    viewBox: "0 0 24 24",
    color: "text-fuchsia-500",
    path: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
      "M12 5v3",
      "M8 9h3",
      "M13 9h3"
    ]
  },
  spa: {
    viewBox: "0 0 24 24",
    color: "text-cyan-500",
    path: [
      "M2 12c.6.5 1.2 1 2.5 1C7 13 7 10.5 9.5 10.5c2.5 0 2.5 2.5 5 2.5 2.5 0 2.5-2.5 5-2.5 1.3 0 1.9.5 2.5 1",
      "M20 20c-2 0-4-1-5-2C14 17 11 17 9 18c-1 1-3 2-5 2",
      "M20 16c-1.35 0-2.7-.5-4-1.5-2.6-2-5.4-2-8 0-1.3 1-2.65 1.5-4 1.5",
      "M16 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
    ]
  },
  grooming: {
    viewBox: "0 0 24 24",
    color: "text-sky-500",
    path: [
      "M18 18h-6a3 3 0 0 1-3-3V7",
      "M18 8a2 2 0 1 1 4 0v1a3 3 0 0 1-4 2",
      "M2 8h10v8H2z",
      "M10 8l-5 8"
    ]
  },
  default: {
    viewBox: "0 0 24 24",
    color: "text-blue-500",
    path: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
    ]
  }
};