import { IKContext, IKUpload } from "imagekitio-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";

const Upload = ({ children, type, setProgress, setData }) => {
  const { getToken } = useAuth();
  const ref = useRef(null);

  const authenticator = async () => {
    try {
      const authToken = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/upload-auth`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth Error:', errorText);
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      console.log('Auth Success:', data);
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error) {
      console.error('Auth Failed:', error);
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  const onError = (err) => {
    console.error('Upload Error:', err);
    toast.error("Image upload failed!");
  };

  const onSuccess = (res) => {
    console.log('Upload Success:', res);
    setData(res);
    setProgress(0);
  };

  const onUploadProgress = (progress) => {
    console.log(progress);
    setProgress(Math.round((progress.loaded / progress.total) * 100));
  };

  return (
    !import.meta.env.VITE_IK_PUBLIC_KEY ? (
      <div>ImageKit public key is missing</div>
    ) : (
      <IKContext
        publicKey={import.meta.env.VITE_IK_PUBLIC_KEY}
        urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
        authenticator={authenticator}
      >
        <IKUpload
          useUniqueFileName
          onError={onError}
          onSuccess={onSuccess}
          onUploadProgress={onUploadProgress}
          className="hidden"
          ref={ref}
          accept={`${type}/*`}
        />
        <div className="cursor-pointer" onClick={() => ref.current.click()}>
          {children}
        </div>
      </IKContext>
    )
  );
};

export default Upload;
