import React, { useState } from 'react';

export default function ImageUploader({ http, matchId, teamGame, onUploadSuccess, isRencontreFinished }) {
    const [uploading, setUploading] = useState({ team: false, form: false });
    const [error, setError] = useState({ team: null, form: null });

    const handleFileUpload = async (type, file) => {
        // Validate that it's an image
        if (!file.type.startsWith('image/')) {
            setError({ ...error, [type]: 'Please select an image file' });
            return;
        }

        setUploading({ ...uploading, [type]: true });
        setError({ ...error, [type]: null });

        const formData = new FormData();
        // Use 'team' or 'form' as the field name, not 'file'
        formData.append(type, file);

        console.log(`📤 Uploading ${type} image:`, file.name, file.type, file.size);

        try {
            const endpoint = type === 'team'
                ? `game/${matchId}/uploadPicture/team`
                : `game/${matchId}/uploadPicture/form`;

            console.log(`🌐 Upload endpoint: ${http.API}${endpoint}`);
            console.log(`📦 FormData entries:`, Array.from(formData.entries()));

            // Don't set Content-Type header - let the browser set it with boundary
            const response = await http.post(http.API + endpoint, formData);

            console.log(`✅ ${type} image uploaded:`, response);
            
            // Call success callback to refresh data
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error(`❌ Error uploading ${type} image:`, err);
            setError({ ...error, [type]: 'Upload error' });
        } finally {
            setUploading({ ...uploading, [type]: false });
        }
    };

    const handleFileSelect = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(type, file);
        }
    };

    const getImageUrl = (type) => {
        const pictureId = type === 'team' ? teamGame.picture : teamGame.formPict;
        return pictureId ? `/matchsPict/${pictureId}` : null;
    };

    return (
        <div className={`image-uploader-container ${isRencontreFinished ? 'rencontre-finished' : ''}`}>
            <h3 className="uploader-title">📷 {http.dico["PICTURES"]}</h3>

            <div className="uploader-grid">
                {/* Team Photo */}
                <div className="uploader-card">
                    <div className="uploader-header">
                        <h4 className="uploader-card-title">{http.dico["TEAM_PICTURE"]}</h4>
                    </div>

                    {getImageUrl('team') && (
                        <div className="image-preview">
                            <img
                                src={getImageUrl('team')}
                                alt="Team photo"
                                className="preview-img"
                            />
                        </div>
                    )}

                    <div className="uploader-actions">
                        <label className={`upload-btn ${isRencontreFinished ? 'disabled' : ''}`}>
                            {uploading.team ? (
                                <span>⏳ Uploading...</span>
                            ) : (
                                <>
                                    <span>📤</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect('team', e)}
                                        disabled={uploading.team || isRencontreFinished}
                                        style={{ display: 'none' }}
                                    />
                                </>
                            )}
                        </label>

                        {error.team && (
                            <div className="upload-error">{error.team}</div>
                        )}
                    </div>
                </div>

                {/* Form Photo */}
                <div className="uploader-card">
                    <div className="uploader-header">
                        <h4 className="uploader-card-title">{http.dico["FORM"]}</h4>
                    </div>

                    {getImageUrl('form') && (
                        <div className="image-preview">
                            <img
                                src={getImageUrl('form')}
                                alt="Match form"
                                className="preview-img"
                            />
                        </div>
                    )}

                    <div className="uploader-actions">
                        <label className={`upload-btn ${isRencontreFinished ? 'disabled' : ''}`}>
                            {uploading.form ? (
                                <span>⏳ Uploading...</span>
                            ) : (
                                <>
                                    <span>📤</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect('form', e)}
                                        disabled={uploading.form || isRencontreFinished}
                                        style={{ display: 'none' }}
                                    />
                                </>
                            )}
                        </label>

                        {error.form && (
                            <div className="upload-error">{error.form}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
