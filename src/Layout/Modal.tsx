import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import type { modalType } from "@/TypeDefinitions/ModalType";
import { useState } from "react";

export function Modal(props: modalType) {
  const [selectedData, setSelectedData] = useState<any>(null);

  const handleSubmit = (e: any, selectedData: any) => {
    e.preventDefault();
    if (props?.saveLocalStorage) {
      props.saveLocalStorage(selectedData);
      window.location.reload();
    }

    props.setOpen(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent className="bg-primary border-0">
        <DialogHeader>
          <DialogTitle className="heading-font">
            Select your appropriate theme
          </DialogTitle>
          <DialogDescription className="description-text">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {props.sentObject.map((item: any, index: number) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start description-text ${item.title === selectedData?.title ? "bg-red-400" : ""}`}
              onClick={() => setSelectedData(item)}
            >
              {item.title}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild className="bg-black">
            <Button onClick={(e) => handleSubmit(e, selectedData)}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
