/**
 * Every string the booking flow renders.
 *
 * Same rule as `lib/listing.ts`, for the same reason: copy lives in the data
 * layer so replacing it is a data edit rather than a component rewrite. It also
 * means the entire vocabulary of the flow — including its error and empty states,
 * which are the strings most often left hardcoded and untranslated — is readable
 * in one place.
 *
 * AUTHORED. The reference's booking panel could not be opened for capture (see
 * the README's provenance note), so these are original strings written to fit the
 * flow. Structure and behaviour are cloned; this wording is ours.
 */
export const BOOKING_COPY = {
  card: {
    /** Shown before any dates are chosen: "<price> for 5 nights". */
    headlineSuffix: (nights: number) => `for ${nights} night${nights === 1 ? "" : "s"}`,
    /** Shown once dates are chosen: "<price> night". */
    perNight: "night",
    checkInLabel: "Check-in",
    checkOutLabel: "Checkout",
    guestsLabel: "Guests",
    datePlaceholder: "Add date",
    reserve: "Reserve",
    reserving: "Reserving…",
    noCharge: "You won't be charged yet",
    totalLabel: "Total",
    clearDates: "Clear dates",
    close: "Close",
  },

  calendar: {
    title: "Select dates",
    /** Announced when the picker opens, and used as the dialog's accessible name. */
    dialogLabel: "Select check-in and checkout dates",
    prevMonth: "Show previous month",
    nextMonth: "Show next month",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    minStayHint: "Minimum stay 1 night.",
    unavailable: "Unavailable",
    promptCheckIn: "Add your travel dates for exact pricing",
    promptCheckOut: "Select your checkout date",
  },

  guests: {
    dialogLabel: "Choose the number of guests",
    /** "2 guests" / "1 guest", plus infants and pets when present. */
    summary: (guests: number) => `${guests} guest${guests === 1 ? "" : "s"}`,
    maxNote: (max: number) => `This place has a maximum of ${max} guests, not including infants.`,
    infantsNote: "Infants don't count toward the guest limit.",
    petsNote: "Bringing a service animal?",
    done: "Close",
    rows: [
      { id: "adults", label: "Adults", hint: "Ages 13 or above" },
      { id: "children", label: "Children", hint: "Ages 2 – 12" },
      { id: "infants", label: "Infants", hint: "Under 2" },
      { id: "pets", label: "Pets", hint: "" },
    ],
    decrease: (label: string) => `Remove one ${label.toLowerCase().replace(/s$/, "")}`,
    increase: (label: string) => `Add one ${label.toLowerCase().replace(/s$/, "")}`,
  },

  confirmation: {
    dialogLabel: "Reservation confirmed",
    heading: "You're booked",
    subheading: "We've sent the details to your email.",
    referenceLabel: "Confirmation code",
    datesLabel: "Dates",
    guestsLabel: "Guests",
    totalLabel: "Total paid",
    done: "Done",
  },

  errors: {
    /** Used when the server sends no message, which should not happen. */
    fallback: "Something went wrong. Please try again.",
    pickDates: "Choose your dates to see the total.",
  },
} as const;
