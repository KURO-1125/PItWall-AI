/**
 * PitWall AI — Advanced Framer Motion Animation Presets
 * Award-winning animation library with smooth, professional transitions
 */

// Fade Animations
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] // Custom easing for smooth motion
    } 
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Scale & Zoom Animations
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.34, 1.56, 0.64, 1] // Bouncy spring effect
    } 
  },
};

export const zoomRotate = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  },
};

// Stagger Animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.15, 
      delayChildren: 0.2,
      when: "beforeChildren"
    },
  },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Slide Animations
export const slideInFromBottom = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const slideInFromTop = {
  hidden: { opacity: 0, y: -60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Hover & Interaction Animations
export const cardHover = {
  scale: 1.05,
  y: -10,
  transition: { 
    duration: 0.3, 
    ease: [0.22, 1, 0.36, 1]
  },
};

export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2, ease: "easeOut" },
};

export const buttonTap = {
  scale: 0.95,
};

// Page Transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Spring Animations
export const counterSpring = {
  type: "spring",
  stiffness: 120,
  damping: 18,
};

export const bouncySpring = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.8,
};

// Reveal Animations
export const revealFromLeft = {
  hidden: { opacity: 0, x: -100, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  },
};

export const revealFromRight = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  },
};

// Blur Animations
export const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  },
};

// Rotation Animations
export const rotateIn = {
  hidden: { opacity: 0, rotate: -180, scale: 0 },
  visible: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
  },
};

// Flip Animations
export const flipIn = {
  hidden: { opacity: 0, rotateX: -90 },
  visible: { 
    opacity: 1, 
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

// Magnetic Effect (for interactive elements)
export const magneticHover = {
  scale: 1.1,
  rotate: [0, -5, 5, 0],
  transition: { 
    duration: 0.4,
    rotate: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut"
    }
  },
};
