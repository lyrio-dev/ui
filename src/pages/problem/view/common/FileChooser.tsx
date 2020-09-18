import React from "react";
import { Button, Form, Header } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./FileChooser.module.less";

import { useIntlMessage } from "@/utils/hooks";
import openUploadDialog from "@/utils/openUploadDialog";

interface FileChooserProps {
  accept?: string[];
  disabled?: boolean;
  single?: boolean;
  message: React.ReactNode;
  onChange: (files: File[]) => void;
}

let FileChooser: React.FC<FileChooserProps> = props => {
  const _ = useIntlMessage("problem");

  return (
    <Form>
      <div className={style.flexContainer}>
        <Header size="small" content={_(".submit.upload_files")} />
        <Button
          disabled={props.disabled}
          onClick={() => openUploadDialog(props.onChange, props.accept.join(", "))}
          content={_(".submit.choose_files")}
        />
      </div>
      <div className={style.message}>{props.message}</div>
    </Form>
  );
};

FileChooser = observer(FileChooser);

export default FileChooser;
