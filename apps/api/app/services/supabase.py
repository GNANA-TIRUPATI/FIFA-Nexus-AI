import os
import httpx

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        # Initialize sync HTTP client if credentials exist
        self.client = httpx.Client() if self.url and self.key else None
        
    def upload_file(self, bucket: str, path: str, file_data: bytes, content_type: str = "image/jpeg") -> str:
        """Upload a file to Supabase storage bucket.
        Falls back to local file storage under the 'public/' directory if credentials are not configured.
        """
        if not self.url or not self.key or not self.client:
            # Fall back to local file system for local development mode
            local_dir = os.path.join(os.getcwd(), "public", "storage", bucket)
            os.makedirs(local_dir, exist_ok=True)
            local_file_path = os.path.join(local_dir, os.path.basename(path))
            with open(local_file_path, "wb") as f:
                f.write(file_data)
            print(f"File stored locally at: {local_file_path}")
            return f"/storage/{bucket}/{os.path.basename(path)}"
            
        # Supabase storage REST upload
        headers = {
            "Authorization": f"Bearer {self.key}",
            "Content-Type": content_type
        }
        upload_url = f"{self.url}/storage/v1/object/{bucket}/{path}"
        try:
            response = self.client.post(upload_url, content=file_data, headers=headers)
            if response.status_code == 200:
                # Return the public URL for the stored asset
                return f"{self.url}/storage/v1/object/public/{bucket}/{path}"
            else:
                print(f"Supabase returned status code {response.status_code}: {response.text}. Saving locally.")
        except Exception as e:
            print(f"Failed to connect to Supabase: {e}. Saving locally.")

        # Fall back to local storage on exception
        local_dir = os.path.join(os.getcwd(), "public", "storage", bucket)
        os.makedirs(local_dir, exist_ok=True)
        local_file_path = os.path.join(local_dir, os.path.basename(path))
        with open(local_file_path, "wb") as f:
            f.write(file_data)
        return f"/storage/{bucket}/{os.path.basename(path)}"

supabase_service = SupabaseService()
