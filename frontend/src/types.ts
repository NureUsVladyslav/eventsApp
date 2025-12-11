export type EventListItem = {
  EventID: number;
  Title: string;
  EventDate: string;
  Category: string | null;
  BasePrice: number;
  VenueName: string;
  OrganizerName: string;
};

export type EventDetailsType = {
  EventID: number;
  Title: string;
  EventDate: string;
  Category: string | null;
  BasePrice: number;
  SeatsTotal: number;
  Description: string | null;
  VenueName: string;
  VenueAddress: string | null;
  VenueCapacity: number | null;
  OrganizerName: string;
  OrganizerEmail: string | null;
  OrganizerPhone: string | null;
};

export type Ticket = {
  TicketID: number;
  TicketNo: string;
  BuyerName: string;
  BuyerEmail: string;
  Quantity: number;
  Price: number;
  PurchaseDate: string;
};

export type EventDetailsResponse = {
  event: EventDetailsType;
  tickets: Ticket[];
  stats: {
    ticketsCount: number;
    organizerEvents: {
      EventID: number;
      Title: string;
      EventDate: string;
      Category: string | null;
      BasePrice: number;
      SeatsTotal: number;
    }[];
  };
};
