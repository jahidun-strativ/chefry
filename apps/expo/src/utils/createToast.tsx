// import Toast from "react-native-root-toast";
import RootSiblingsManager from "react-native-root-siblings";

import { Toast } from "@/components/toast";

interface ToastOptions {
  message: string;
  id?: string;
  duration?: "short" | "long";
  type: "loading" | "success" | "error";
}

const createToast = ({ message, duration = "short", type, id }: ToastOptions) => {
  let node: RootSiblingsManager | null = null;

  const handleClose = () => {
    node?.destroy();
  };

  node = new RootSiblingsManager(<Toast message={message} duration={duration} type={type} onClose={handleClose} />);

  setTimeout(() => {
    node?.destroy();
  }, 5000);

  // Toast.show(message, {
  //   // duration: duration === "short" ? Toast.durations.SHORT : Toast.durations.LONG,
  //   duration: Toast.durations.LONG,
  //   position: Toast.positions.TOP,
  //   shadow: true,
  //   animation: true,
  //   hideOnPress: true,
  //   // containerStyle: {
  //   //   zIndex: 1000000,
  //   //   position: "absolute",
  //   //   top: 0,
  //   //   left: 0,
  //   //   right: 0,
  //   //   bottom: 0,
  //   //   backgroundColor: "rgba(0,0,0,0.6)",
  //   // },
  // });

  // return toast("", {
  //   id,
  //   disableShadow: true,
  //   customToast: (toast) => (
  //     <View
  //       className="z-[1000] -mt-4 flex w-full flex-row items-center justify-start rounded-full bg-black px-4 py-3"
  //       style={{ width: toast.width }}
  //     >
  //       <View className="flex items-center justify-center rounded-full bg-black bg-white/20" style={{ width: 30, height: 30 }}>
  //         {type === "loading" && <Spinner size={20} />}
  //         {type === "success" && <Icons color="white" name="check" size={30} />}
  //         {type === "error" && (
  //           <Text className="text-xl text-white" style={{ fontFamily: "Inter_600SemiBold" }} maxFontSizeMultiplier={maxFontSizeMultiplier}>
  //             !
  //           </Text>
  //         )}
  //       </View>
  //       <View className="relative ml-3 flex flex-1 pr-4">
  //         <View className="min-h-12 flex w-full flex-col justify-center">
  //           {!description && (
  //             <>
  //               <View className="flex justify-center">
  //                 <Typography cls="text-sm text-white" variant="h2">
  //                   {title}
  //                 </Typography>
  //               </View>
  //             </>
  //           )}
  //           {!!description && (
  //             <>
  //               <Typography cls="text-white" variant="h3">
  //                 {title}
  //               </Typography>
  //               <Typography cls="text-white" variant="p">
  //                 {description}
  //               </Typography>
  //             </>
  //           )}
  //         </View>
  //       </View>
  //     </View>
  //   ),
  // });
};

export default createToast;
