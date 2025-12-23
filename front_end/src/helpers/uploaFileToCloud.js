export const handleUpload = async (file, type = "image") => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset_unsigned");

    // Xử lý endpoint dựa trên type
    // Cloudinary hỗ trợ: image, video, và raw (cho file 3D, PDF, v.v.)
    let endpoint = "image"; 
    if (type === "video") {
        endpoint = "video";
    } else if (type === "3d" || type === "raw") {
        endpoint = "raw";
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/${endpoint}/upload`;

    try {
        const res = await fetch(uploadUrl, { method: "POST", body: formData });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error?.message || `Lỗi tải lên: ${res.status}`);
        }

        const data = await res.json();
        console.log(`Cloudinary ${type} URL:`, data.secure_url);
        return data.secure_url;
        
    } catch (error) {
        console.error("Upload thất bại:", error.message);
        throw new Error(`Tải file thất bại: ${error.message}`);
    }
};