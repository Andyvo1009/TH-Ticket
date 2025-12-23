import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import eventApi from '../apis/eventApi';
import { authApi } from '../apis/authApi';
import { Editor } from '@tinymce/tinymce-react';
import Footer from '../components/Footer';
interface TicketType {
  typeName: string;
  price: number;
  quantity: number;
}

interface Location {
  code: number;
  name: string;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const handleTicketTypeCount = (e: React.ChangeEvent<HTMLInputElement>) => {
  const count = parseInt(e.target.value) || 0;

  const newTypes = Array.from({ length: count }, () => ({
    typeName: "",
    price: 0,
    quantity: 0,
  }));

  setTicketTypes(newTypes);
  setFormData(prev => ({
    ...prev,
    ticketTypes: newTypes
  }));
};
  const handleTicketTypeChange = (
  index: number,
  field: keyof TicketType,
  value: string | number
) => {
  const updatedTypes = [...ticketTypes];
  updatedTypes[index] = {
    ...updatedTypes[index],
    [field]: field === "price" || field === "quantity" ? Number(value) : value
  };
  setTicketTypes(updatedTypes);
  setFormData(prev => ({
    ...prev,
    ticketTypes: updatedTypes
  }));
};
  // Load provinces on page load
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await eventApi.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) return;

    const fetchDistricts = async () => {
      try {
        const data = await eventApi.getDistricts(Number(selectedProvince));
        setDistricts(data);
      } catch (error) {
        console.error('Error loading districts:', error);
      }
    };
    
    fetchDistricts();
    setWards([]); // reset wards when province changes
    setSelectedDistrict(null);
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (!selectedDistrict) return;

    const fetchWards = async () => {
      try {
        const data = await eventApi.getWards(Number(selectedDistrict));
        setWards(data);
      } catch (error) {
        console.error('Error loading wards:', error);
      }
    };
    
    fetchWards();
  }, [selectedDistrict]);
  const categoryMap: Record<string, string> = {
  "Âm nhạc": "Music",
  "Thể thao": "Sports",
  "Nghệ thuật": "Theatre",
  "Khác": "Others"
};
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    ticketTypes: [] as TicketType[],
    price: 0,
    totalTickets: 0,
    imageFile: null as File | null,
    imagePreview: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const isAuth = await authApi.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'totalTickets' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Save actual file to upload
  setFormData(prev => ({
    ...prev,
    imageFile: file
  }));

  // Generate preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData(prev => ({
      ...prev,
      imagePreview: reader.result as string
    }));
  };

  reader.readAsDataURL(file);
};

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề sự kiện');
      return false;
    }
    if (!formData.category) {
      setError('Vui lòng chọn thể loại');
      return false;
    }
    if (!formData.date) {
      setError('Vui lòng chọn ngày');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Vui lòng nhập địa điểm');
      return false;
    }
    // if (formData.totalTickets <= 0) {
    //   setError('Số vé phải lớn hơn 0');
    //   return false;
    // }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    const provinceName = provinces.find(p => p.code === Number(selectedProvince))?.name;
    const districtName = districts.find(d => d.code === Number(selectedDistrict))?.name;
    const wardName = wards.find(w => w.code === Number(selectedWard))?.name;
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    const englishCategory = categoryMap[formData.category] || "Others";
    form.append("category", englishCategory);
    form.append("date", formData.date);
    form.append("time", formData.time);
    form.append("location", formData.location);
    form.append("province", provinceName || '');
    form.append("district", districtName || '');
    form.append("ward", wardName || '');
    form.append("address", formData.address);
    form.append("ticketTypes", JSON.stringify(formData.ticketTypes));

    if (formData.imageFile) {
      form.append("image", formData.imageFile);
    }
    const res = await eventApi.createEvent(form as any);

    const response = res;

    if (response.success && response.event) {
      setSuccess(true);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        province: '',
        district: '',
        ward: '',
        address: '',
        ticketTypes: [],
        price: 0,
        totalTickets: 0,
        imageFile: null,
        imagePreview: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000);

    } else {
      setError(response.message || 'Không thể tạo sự kiện');
    }

  } catch (err: any) {
    console.error("Error creating event:", err);
    setError(err.message || "Lỗi khi tạo sự kiện");
  } finally {
    setLoading(false);
  }
};

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card bg-dark text-white border-secondary">
              <div className="card-body p-5">
                <h1 className="card-title mb-2 display-6">Tạo Sự Kiện Mới</h1>
                <p className="text-white mb-4">Chia sẻ sự kiện tuyệt vời của bạn với mọi người</p>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close btn-close-white" onClick={() => setError(null)}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    ✓ Sự kiện được tạo thành công! Đang chuyển hướng...
                    <button type="button" className="btn-close btn-close-white" onClick={() => setSuccess(false)}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Basic Info */}
                  <h5 className="mb-3 text-primary">
                    <i className="bi bi-info-circle me-2"></i>Thông Tin Cơ Bản
                  </h5>

                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Tiêu Đề Sự Kiện <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control bg-secondary text-white border-secondary"
                      placeholder="Nhập tiêu đề sự kiện"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="category" className="form-label">
                        Thể Loại <span className="text-danger">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        className="form-select bg-secondary text-white border-secondary"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Chọn thể loại --</option>
                        <option value="Âm nhạc">Âm nhạc</option>
                        <option value="Thể thao">Thể thao</option>
                        <option value="Nghệ thuật">Nghệ thuật (kịch, múa, hội họa)</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="image" className="form-label">
                        Hình Ảnh Sự Kiện
                      </label>
                      <input
                        type="file"
                        id="image"
                        name="image"
                        className="form-control bg-secondary text-white border-secondary"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  {formData.imagePreview && (
                    <div className="mb-3">
                      <img src={formData.imagePreview} alt="Preview" className="img-thumbnail" style={{ maxWidth: '300px' }} />
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Mô Tả Chi Tiết
                    </label>
                    <Editor
                      apiKey="waz9zacqmgrfld24gs1m1ln6w6193e43h7p97hzkqz968cnh" // Get free key from tinymce.com
                      value={formData.description}
                      onEditorChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
                      init={{
                        height: 300,
                        menubar: true,
                        plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'],
                        toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                        skin: 'oxide-dark',
                        content_css: 'dark',
                        placeholder: 'Mô tả chi tiết về sự kiện...'
                      }}
                    />
                  </div>

                  {/* Date & Time */}
                  <h5 className="mb-3 text-primary">
                    <i className="bi bi-calendar-event me-2"></i>Ngày Giờ
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="date" className="form-label">
                        Ngày Diễn Ra <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="form-control bg-secondary text-white border-secondary"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="time" className="form-label">
                        Thời Gian
                      </label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        className="form-control bg-secondary text-white border-secondary"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <h5 className="mb-3 text-primary">
                    <i className="bi bi-geo-alt me-2"></i>Địa Điểm
                  </h5>
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      Tên Địa Điểm <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      className="form-control bg-secondary text-white border-secondary"
                      placeholder="Nhập tên địa điểm"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <div className="mb-3">
                    <select
                    className="form-select bg-secondary text-white border-secondary"
                  value={selectedProvince || ""}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  >
                    
                  <option value="">-- Select Province --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                    </select>
                    </div>
                    <div className="mb-3">
                      <select
                      className="form-select bg-secondary text-white border-secondary"
                      value={selectedDistrict || ""}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                    >
                    <option value="">-- Select District --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                      </div>
                  {/* Ward */}
                  <select
                    className="form-select bg-secondary text-white border-secondary"
                    value={selectedWard || ""}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">-- Select Ward --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                      Địa Chỉ Chi Tiết
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="form-control bg-secondary text-white border-secondary"
                      placeholder="Nhập địa chỉ chi tiết"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    {/* District */}
     
                  </div>

                  {/* Tickets & Pricing */}
                  <h5 className="mb-3 text-primary">
                    <i className="bi bi-ticket me-2"></i>Vé & Giá
                  </h5>
                  <div className="row mb-4">
  <label className="form-label">
    Số loại vé <span className="text-danger">*</span>
  </label>
  <div className="col-md-6">
    <input
      type="number"
      className="form-control bg-secondary text-white border-secondary"
      placeholder="Nhập số loại vé"
      min="1"
      onChange={handleTicketTypeCount}
    />
  </div>
</div>

{/* Ticket Types Fields */}
<div className="row">
  {ticketTypes.map((ticket, index) => (
    <div key={index} className="border rounded p-3 mb-3">
      <h6 className="text-info">Loại vé #{index + 1}</h6>

      <div className="row">
        {/* Name */}
        <div className="col-md-4 mb-3">
          <label className="form-label">Tên loại vé <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control bg-secondary text-white border-secondary"
            placeholder="VD: VIP, Thường..."
            value={ticket.typeName}
            onChange={(e) => handleTicketTypeChange(index, "typeName", e.target.value)}
          />
        </div>

        {/* Quantity */}
        <div className="col-md-4 mb-3">
          <label className="form-label">Số lượng <span className="text-danger">*</span></label>
          <input
            type="number"
            className="form-control bg-secondary text-white border-secondary"
            placeholder="0"
            min="1"
            value={ticket.quantity}
            onChange={(e) => handleTicketTypeChange(index, "quantity", e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="col-md-4 mb-3">
          <label className="form-label">Giá vé (đ) <span className="text-danger">*</span></label>
          <input
            type="number"
            className="form-control bg-secondary text-white border-secondary"
            placeholder="0"
            min="0"
            step="1000"
            value={ticket.price}
            onChange={(e) => handleTicketTypeChange(index, "price", e.target.value)}
          />
        </div>
      </div>
    </div>
  ))}
</div>
                  
                    

                  {/* <div className="alert alert-info mb-4">
                    <strong>Tổng giá trị sự kiện:</strong> {' '}
                    <span className="fw-bold">
                      {(formData.price * formData.totalTickets).toLocaleString('vi-VN')} đ
                    </span>
                  </div> */}

                  {/* Form Actions */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-light"
                      onClick={() => navigate('/')}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Tạo Sự Kiện
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
