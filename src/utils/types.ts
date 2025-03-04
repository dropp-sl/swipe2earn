type Coordinates = {
  x: number;
  y: number;
  height: number;
  width: number;
};

type Annotation = {
  label: string;
  category: string;
  coordinates: Coordinates;
};

type Swipe2EarnStatistics = {
  totalSwipePoints: number;
  totalSwipeCount: number;
  totalDgnSupply: number;
  totalDgnStaked: number;
};

export type { Annotation, Coordinates, Swipe2EarnStatistics };
