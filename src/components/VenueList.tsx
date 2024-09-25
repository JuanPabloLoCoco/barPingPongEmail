import React from "react";

interface Venue {
  id: number;
  name: string;
  address: string;
}

interface VenueListProps {
  venues: Venue[];
}

export default function VenueList({ venues }: VenueListProps) {
  return (
    <ul>
      {venues.map((venue) => (
        <li key={venue.id}>
          <h3>{venue.name}</h3>
          <p>{venue.address}</p>
        </li>
      ))}
    </ul>
  );
}
