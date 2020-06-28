import React, { useState } from "react";
import { Modal, ModalProps } from "semantic-ui-react";

export function useDialog(
  props: ModalProps,
  header: React.ReactNode | (() => React.ReactNode),
  content: React.ReactNode | (() => React.ReactNode),
  actions: React.ReactNode | (() => React.ReactNode)
) {
  const [open, setOpen] = useState(false);
  return {
    element: (
      <Modal {...props} open={open}>
        {open && (typeof header === "function" ? header() : header)}
        <Modal.Content>{open && (typeof content === "function" ? content() : content)}</Modal.Content>
        <Modal.Actions>{open && (typeof actions === "function" ? actions() : actions)}</Modal.Actions>
      </Modal>
    ),
    isOpen: open,
    open: () => setOpen(true),
    close: () => setOpen(false)
  };
}
