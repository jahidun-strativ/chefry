import type { FC } from "react";
import { View } from "react-native";
import type { GraphPoint } from "react-native-graph";
import { LineGraph } from "react-native-graph";
import { startOfMonth, sub } from "date-fns";

import Typography from "./ui/typography";

const firstDay = startOfMonth(new Date());
const points: GraphPoint[] = [
  { date: firstDay, value: 10 },
  { date: sub(firstDay, { months: 1 }), value: 20 },
  { date: sub(firstDay, { months: 2 }), value: 10 },
  { date: sub(firstDay, { months: 3 }), value: 30 },
  { date: sub(firstDay, { months: 4 }), value: 40 },
  { date: sub(firstDay, { months: 5 }), value: 20 },
  { date: sub(firstDay, { months: 6 }), value: 30 },
  { date: sub(firstDay, { months: 7 }), value: 20 },
  { date: sub(firstDay, { months: 8 }), value: 35 },
].reverse();

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];

const FollowersGraph: FC = () => {
  return (
    <View className="p-4">
      <Typography cls="text-center mb-2 mt-6" variant="h2">
        Follower activity
      </Typography>
      <View className="mb-4 mt-4 h-96 w-full overflow-hidden rounded-2xl border border-white">
        <LineGraph
          points={points}
          color="#FFFFFF"
          animated
          style={{ height: "100%" }}
          enableIndicator
          enablePanGesture
          range={{ x: { min: sub(firstDay, { months: 8 }), max: firstDay }, y: { min: 5, max: 50 } }}
          BottomAxisLabel={() => (
            <View className="flex h-12 w-full flex-row items-center pb-3">
              {points.map((point, index) => (
                <View key={index} className="justify-cetnert flex flex-1 items-center">
                  <Typography cls="rotate-[-60deg] text-xs">{months[point.date.getMonth()]}</Typography>
                </View>
              ))}
            </View>
          )}
        />
      </View>

      <Typography cls="text-center mb-2 mt-4 text-xl" variant="h2">
        Followers
      </Typography>
    </View>
  );
};

export default FollowersGraph;
