export const handleUpload = async (file, type = "image") => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset_unsigned");
    const endpoint = type === "3d" ? "raw" : "image";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME}/${endpoint}/upload`;

    try {
        const res = await fetch(uploadUrl, { method: "POST", body: formData });

        if (!res.ok) {
            // Đọc response body để lấy thông báo lỗi chi tiết từ Cloudinary
            const data = await res.json();
            throw new Error(data.error?.message || `Lỗi tải lên: ${res.status}`);
        }

        const data = await res.json();
        console.log("Cloudinary URL:", data.secure_url);
        return data.secure_url;
        
    } catch (error) {
        console.error("Upload thất bại:", error.message);
        throw new Error(`Tải file thất bại: ${error.message}`); // Ném lại lỗi để component xử lý
    }
};