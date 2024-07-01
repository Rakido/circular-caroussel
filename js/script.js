// Animations 
// Animations 

gsap.registerPlugin(ScrollTrigger, Flip, Draggable);

let wheel = document.querySelector(".wheel"),
    images = gsap.utils.toArray(".wheel__card"),
    cards = gsap.utils.toArray(".wheel__card"),
    header = document.querySelector(".header"),
    currentCard, // keep track of last clicked card so we can put it back
    slice = 360 / (cards.length), // Adjusted to reduce space, accounting for duplication
    currentRotation = 0,
    rotationVelocity = 0,
    isDragging = false,
    lastRotation = 0;

function duplicateCards() {
  images.forEach(card => {
    let clone = card.cloneNode(true);
    wheel.appendChild(clone);
  });
  cards = gsap.utils.toArray(".wheel__card");
}

function setup() {
  let isMobile = window.innerWidth <= 768;
  let spacingCard = window.innerWidth <= 768 ? 0.5 : 1;
  let radiusX = isMobile ? wheel.offsetHeight / 1.5 : wheel.offsetHeight / 2, // Adjust vertical radius for mobile view
      radiusY = isMobile ? wheel.offsetHeight / 1.5 : wheel.offsetHeight / 2, // Adjust vertical radius for mobile view
      centerX = wheel.offsetWidth / 2,
      centerY = wheel.offsetHeight / 2,
      slice = 270 / (cards.length / 2) * spacingCard, // Adjusted to reduce space, accounting for duplication
      DEG2RAD = Math.PI / 180;
      
  gsap.set(cards, {
    x: i => centerX + radiusX * Math.sin(i * slice * DEG2RAD),
    y: i => centerY - radiusY * Math.cos(i * slice * DEG2RAD),
    rotation: i => i * slice,
    xPercent: -50,
    yPercent: -50
  });
  
  // Set the initial rotation to position cards correctly
  let initialRotation = -35; // Adjust this value to start in the middle
  
  gsap.set(wheel, {
    rotation: initialRotation
  });

  currentRotation = initialRotation;
}

function rotateWheel(direction) {
  currentRotation += direction * slice;
  gsap.to(wheel, {
    rotation: currentRotation,
    duration: 1.5,
    ease: "power4.inOut"
  });
}

// Lerp function for smooth transition
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// Draggable setup
Draggable.create(wheel, {
  type: "rotation",
  onDragStart: function() {
    isDragging = true;
    rotationVelocity = 0;
    lastRotation = this.rotation;
  },
  onDrag: function() {
    let newRotation = this.rotation;
    rotationVelocity = newRotation - lastRotation;
    lastRotation = newRotation;
    currentRotation = newRotation;
  },
  onDragEnd: function() {
    isDragging = false;
    applyInertia();
  }
});

// Apply inertia effect
function applyInertia() {
  if (isDragging) return;

  // Reduce the rotation velocity gradually
  rotationVelocity *= 0.95;

  // Stop applying inertia if the velocity is very low
  if (Math.abs(rotationVelocity) < 0.01) {
    rotationVelocity = 0;
    return;
  }

  // Update the current rotation
  currentRotation += rotationVelocity;

  // Apply the rotation to the wheel
  gsap.set(wheel, {
    rotation: currentRotation
  });

  // Continue applying inertia on the next frame
  requestAnimationFrame(applyInertia);
}

duplicateCards();
setup();

window.addEventListener("resize", setup);

gsap.to(wheel, {
  rotation: "-=360", // Ensure it continues from the initial state
  ease: "none",
  duration: cards.length / 2, // Account for duplicated cards
  scrollTrigger: {
    start: 0,
    end: "max",
    scrub: 2,
    onUpdate: self => {
      if (self.progress === 1 || self.progress === 0) {
        self.scroll(self.start + 1); // Reset scroll position
      }
    }
  },
  modifiers: {
    rotation: gsap.utils.unitize(value => parseFloat(value) % 360) // Modifies the rotation value to keep it within 0-360 degrees
  }
});

document.querySelector(".next").addEventListener("click", () => rotateWheel(-1));
document.querySelector(".prev").addEventListener("click", () => rotateWheel(1));

const scaleOnHover = (e) => {
  gsap.to(e.currentTarget, {
    scale: 1.1,
    duration: 0.3,
    ease: "cubic-bezier(0, 1, 0.75, 0.97)"
  });
};

const resetScale = (e) => {
  gsap.to(e.currentTarget, {
    scale: 1,
    duration: 0.1,
    ease: "power4.inOut"
  });
};

cards.forEach((card) => {
  card.addEventListener("mouseover", scaleOnHover);
  card.addEventListener("mouseout", resetScale);
});


// TODO
// cards.forEach((card, i) => {
//   gsap.fromTo(card, {
//     scale: 0.8,
//     opacity: 0
//   }, {
//     scale: 1,
//     opacity: 1,
//     duration: 0.5,
//     ease: "power4.inOut",
//     scrollTrigger: {
//       trigger: card,
//       markers: true,
//       start: "top 50%", // Adjust based on when you want the animation to start
//       end: "bottom", // Adjust based on when you want the animation to end
//       scrub: true,
//       onEnter: () => gsap.to(card, { scale: 1, opacity: 1, duration: 0.5, ease: "power4.inOut" }),
//       onLeave: () => gsap.to(card, { scale: 0.8, opacity: .5, duration: 0.5, ease: "power4.inOut" }),
//       onEnterBack: () => gsap.to(card, { scale: 1, opacity: 1, duration: 0.5, ease: "power4.inOut" }),
//       onLeaveBack: () => gsap.to(card, { scale: 0.8, opacity: .5, duration: 0.5, ease: "power4.inOut" })
//     }
//   });
// });