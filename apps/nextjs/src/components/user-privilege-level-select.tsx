import type { FC } from "react";

import type { RouterOutputs } from "@startracker/api";

import { api } from "@/utils/api";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "./ui/spinner";
import { useToast } from "./ui/use-toast";

type TableUser = RouterOutputs["admin"]["user"]["list"]["users"][number];

interface Props {
  user: TableUser;
  refetchUser: () => Promise<void>;
}

const UserPrivilegeLevelSelect: FC<Props> = ({ user, refetchUser }) => {
  const { toast } = useToast();

  const { mutate, isLoading } = api.admin.user.setPrivilegeLevel.useMutation({
    onSuccess: async () => {
      await refetchUser();
      toast({
        description: "Privilege level updated!",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        description: "Error updating privilege level.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="relative">
      <Select
        disabled={isLoading}
        value={user.privilegeLevel}
        onValueChange={(value) => mutate({ id: user.id, privilegeLevel: value as "ADMIN" | "USER" })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a privilege level" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Privilege level</SelectLabel>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="USER">User</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20">
          <Spinner className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default UserPrivilegeLevelSelect;
