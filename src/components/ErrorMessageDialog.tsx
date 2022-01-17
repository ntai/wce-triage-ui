import React, {useState} from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export default function ErrorMessageModal(errorTitle: string, errorMessage: string) {
  const [isOpen, setIsOpen] = useState(true);
  return (
      <Dialog open={isOpen} >
        <DialogTitle>
          Image loading
        </DialogTitle>
        <DialogContent>
          <h4>{errorTitle}</h4>
          <p>
            {errorMessage}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setIsOpen(false)}}>Close</Button>
        </DialogActions>
      </Dialog>
  );
}
