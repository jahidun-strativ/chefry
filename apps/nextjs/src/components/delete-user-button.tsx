import { useState } from "react";
import { TrashIcon } from "lucide-react";

import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "./ui/spinner";
import { useToast } from "./ui/use-toast";

export function DeleteUserButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  const { data: user, isLoading } = api.admin.user.get.useQuery({ id }, { enabled: open });
  const utils = api.useContext();
  const { toast } = useToast();
  const { mutate: deleteUser, isLoading: isDeletingUser } = api.admin.user.delete.useMutation({
    onError: () => {
      toast({
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      await utils.admin.user.list.invalidate();
      toast({
        description: "User deleted!",
        variant: "default",
      });
      setOpen(false);
    },
  });

  const handleDeleteUser = () => deleteUser({ id });

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {user && !isLoading && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete the user {user?.username}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" disabled={isDeletingUser} onClick={handleDeleteUser}>
                {isDeletingUser && <Spinner className="mr-2 h-4 w-4 text-white" />}
                <span>Confirm</span>
              </Button>
            </AlertDialogFooter>
          </>
        )}
        {(!user || isLoading) && (
          <div className="flex min-h-[150px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
