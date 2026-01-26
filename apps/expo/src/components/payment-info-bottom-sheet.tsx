import type { FC } from "react";
import { View } from "react-native";

import BottomSheet from "./ui/bottom-sheet";
import Typography from "./ui/typography";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentInfoBottomSheet: FC<Props> = ({ isOpen, onClose }) => {
  return (
    <BottomSheet open={isOpen} onClose={onClose}>
      <View className="flex flex-col px-2 pb-6">
        <Typography variant="h2" fontWeight="bold" cls="mb-6 mt-4 text-center">
          How do payments work?
        </Typography>

        <View className="mb-4">
          <Typography variant="h3" cls="text-center text-lg">
            How much money do I earn?
          </Typography>
          <Typography variant="p" cls="text-center">
            You earn 70% of the subscription price you self-selected.
          </Typography>
        </View>

        <View className="mb-4">
          <Typography variant="h3" cls="text-center text-lg">
            When you get paid
          </Typography>
          <Typography variant="p" cls="text-center">
            Payouts are made on a monthly basis on the 1st of each month.
          </Typography>

          <Typography variant="p" cls="text-center mt-4">
            Star Tracker pays you in EURO and the money is sent to the bank account you have connected to your payout account. Any
            conversions to your local currency are done via your bank.
          </Typography>
        </View>

        <View className="mb-4">
          <Typography variant="h3" cls="text-center text-lg">
            Your income
          </Typography>
          <Typography variant="p" cls="text-center">
            It is your responsability to pay taxes in your country.
          </Typography>
        </View>
      </View>
    </BottomSheet>
  );
};

export default PaymentInfoBottomSheet;
