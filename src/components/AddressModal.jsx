import React from 'react';  
import PropTypes from 'prop-types'; 
import '../AddressModal.css'; 

const AddressModal = ({ show, onClose, address, onSubmit, onChange, formData }) => {  
    if (!show) return null;  

    return (  
        <div className="modal-overlay">  
            <div className="modal-content">  
                <h2>{address ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h2>  
                <form onSubmit={onSubmit}>  
                    <div className="form-group">  
                        <label>Adres Başlığı</label>  
                        <input  
                            type="text"  
                            name="title"  
                            value={formData.title}  
                            onChange={onChange}  
                            required  
                        />  
                    </div>  
                    <div className="form-group">  
                        <label>Açık Adres</label>  
                        <textarea  
                            name="fullAddress"  
                            value={formData.fullAddress}  
                            onChange={onChange}  
                            required  
                        />  
                    </div>  
                    <div className="form-group">  
                        <label>İlçe</label>  
                        <input  
                            type="text"  
                            name="district"  
                            value={formData.district}  
                            onChange={onChange}  
                            required  
                        />  
                    </div>  
                    <div className="form-group">  
                        <label>Şehir</label>  
                        <input  
                            type="text"  
                            name="city"  
                            value={formData.city}  
                            onChange={onChange}  
                            required  
                        />  
                    </div>  
                    <div className="form-group">  
                        <label>Posta Kodu</label>  
                        <input  
                            type="text"  
                            name="postalCode"  
                            value={formData.postalCode}  
                            onChange={onChange}  
                            required  
                        />  
                    </div>  
                    <div className="modal-actions">  
                        <button type="submit" className="save-btn">  
                            {address ? 'Güncelle' : 'Kaydet'}  
                        </button>  
                        <button type="button" className="cancel-btn" onClick={onClose}>  
                            İptal  
                        </button>  
                    </div>  
                </form>  
            </div>  
        </div>  
    );  
};  

// Props type checking (opsiyonel ama önerilen)  
AddressModal.propTypes = {  
    show: PropTypes.bool.isRequired,  
    onClose: PropTypes.func.isRequired,  
    address: PropTypes.object,  
    onSubmit: PropTypes.func.isRequired,  
    onChange: PropTypes.func.isRequired,  
    formData: PropTypes.shape({  
        title: PropTypes.string,  
        fullAddress: PropTypes.string,  
        district: PropTypes.string,  
        city: PropTypes.string,  
        postalCode: PropTypes.string  
    }).isRequired  
};  

export default AddressModal;  