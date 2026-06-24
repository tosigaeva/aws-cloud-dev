import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [isUploading, setIsUploading] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    const authorizationToken = localStorage
      .getItem("authorization_token")
      ?.trim();

    try {
      const response = await axios.get<string>(url, {
        params: {
          name: file.name,
        },
        headers: authorizationToken
          ? {
              Authorization: `Basic ${authorizationToken}`,
            }
          : undefined,
      });

      await fetch(response.data, {
        method: "PUT",
        headers: {
          "Content-Type": "text/csv",
        },
        body: file,
      });

      setFile(undefined);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <Button disabled={isUploading} onClick={removeFile}>
            Remove file
          </Button>
          <Button disabled={isUploading} onClick={uploadFile}>
            {isUploading ? "Uploading..." : "Upload file"}
          </Button>
        </div>
      )}
    </Box>
  );
}
