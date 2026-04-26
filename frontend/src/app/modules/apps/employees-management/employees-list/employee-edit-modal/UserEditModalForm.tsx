import { FC, useState, useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import clsx from "clsx";
import { useListView } from "../core/ListViewProvider";
import { useQueryResponse } from "../core/QueryResponseProvider";
import { createUser, updateUser } from "../core/_requests";
import { User } from "../core/_models";
import { isNotEmpty, QUERIES } from "../../../../../../_metronic/helpers";
import { useMutation, useQueryClient } from "react-query";
import { EmployeesListLoading } from "../components/loading/EmployeesListLoading";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../../../../firebase/useFirebase"; // ✅ ปรับ path ให้ตรง

type Props = {
  isUserLoading: boolean;
  user?: Partial<User>;
};

const userSchema = Yup.object().shape({
  name: Yup.string().required("ກະລຸນາປ້ອນຊື່"),
  lastname: Yup.string().required("ກະລຸນາປ້ອນນາມສະກຸນ"),
  email: Yup.string().email("ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ").required("ກະລຸນາປ້ອນອີເມວ"),
  phone_number: Yup.string(),
  password: Yup.string().when("_id", {
    is: (id: string) => !id,
    then: (schema) =>
      schema.min(6, "ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ").required("ກະລຸນາປ້ອນລະຫັດຜ່ານ"),
    otherwise: (schema) => schema.notRequired(),
  }),
  status: Yup.string().required("ກະລຸນາເລືອກສະຖານະ"),
  role: Yup.string().required("ກະລຸນາເລືອກບົດບາດ"),
});

const initialValues: Partial<User> = {
  name: "",
  lastname: "",
  email: "",
  phone_number: "",
  password: "",
  status: "Active",
  role: "employee",
  image_url: "",
};

const UserEditModalForm: FC<Props> = ({ user, isUserLoading }) => {
  const { setItemIdForUpdate } = useListView();
  const { query } = useQueryResponse();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(user?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = isNotEmpty(user?._id);

  const invalidateUsers = () =>
    queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return user?.image_url || null;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `users/${userId}/profile_${Date.now()}`)
      const snapshot = await uploadBytes(storageRef, imageFile)
      const url = await getDownloadURL(snapshot.ref)
      return url
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation(createUser, {
    onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: '<span style="color: #10b981;">ສ້າງຜູ້ໃຊ້ສຳເລັດ</span>',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
        invalidateUsers();
        setItemIdForUpdate(undefined);
        window.location.reload();
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: "ສ້າງຜູ້ໃຊ້ບໍ່ສຳເລັດ",
        text: error?.message || "ມີບັນຫາບາງຢ່າງ",
        confirmButtonText: "ຕົກລົງ",
      });
    },
  });

  const updateMutation = useMutation(
    (data: User) => updateUser(data._id, data),
    {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: '<span style="color: #10b981;">ອັບເດດຜູ້ໃຊ້ສຳເລັດ</span>',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          invalidateUsers();
          setItemIdForUpdate(undefined);
          window.location.reload();
        });
      },
      onError: () => {
        Swal.fire({
          icon: "error",
          title: "ຂໍ້ຜິດພາດ",
          text: "ອັບເດດຜູ້ໃຊ້ບໍ່ສຳເລັດ",
        });
      },
    }
  );

  const formik = useFormik<Partial<User>>({
    initialValues: {
      ...initialValues,
      ...user,
    },
    validationSchema: userSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // ใช้ _id สำหรับ path หรือ timestamp ถ้า create ใหม่
        const tempId = user?._id || `temp_${Date.now()}`
        const imageUrl = await uploadImage(tempId)

        const payload = {
          ...values,
          image_url: imageUrl || values.image_url || "",
        }

        if (isEditMode && user?._id) {
          await updateMutation.mutateAsync({ ...payload, _id: user._id } as User);
        } else {
          await createMutation.mutateAsync(payload as User);
        }
        setItemIdForUpdate(undefined);
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isSubmitting =
    formik.isSubmitting || createMutation.isLoading || updateMutation.isLoading || isUploading;

  const fieldClass = (name: keyof User) =>
    clsx("form-control form-control-solid", {
      "is-invalid": formik.touched[name] && formik.errors[name],
    });

  return (
    <>
      <form className="form" onSubmit={formik.handleSubmit} noValidate>

        {/* Profile Image */}
        <div className="fv-row mb-7 text-center">
          <label className="fw-bold fs-6 mb-3 d-block">ຮູບໂປຣໄຟລ໌</label>
          <div
            className="position-relative d-inline-block"
            style={{ cursor: "pointer" }}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="rounded-circle"
                style={{ width: 90, height: 90, objectFit: "cover", border: "3px solid #e2e8f0" }}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-light"
                style={{ width: 90, height: 90, border: "3px dashed #cbd5e1" }}
              >
                <i className="ki-duotone ki-camera fs-2x text-gray-400">
                  <span className="path1" /><span className="path2" />
                </i>
              </div>
            )}
            <div
              className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center bg-primary"
              style={{ width: 26, height: 26 }}
            >
              <i className="ki-duotone ki-pencil fs-7 text-white">
                <span className="path1" /><span className="path2" />
              </i>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleImageChange}
            disabled={isSubmitting || isUserLoading}
          />
          {imagePreview && (
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-sm btn-light-danger"
                onClick={() => { setImagePreview(""); setImageFile(null); formik.setFieldValue("image_url", ""); }}
                disabled={isSubmitting || isUserLoading}
              >
                ລຶບຮູບ
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">ຊື່</label>
          <input
            type="text"
            {...formik.getFieldProps("name")}
            className={fieldClass("name")}
            disabled={isSubmitting || isUserLoading}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="fv-plugins-message-container">
              <span role="alert" className="fv-help-block">{formik.errors.name}</span>
            </div>
          )}
        </div>

        {/* Last Name */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">ນາມສະກຸນ</label>
          <input
            type="text"
            {...formik.getFieldProps("lastname")}
            className={fieldClass("lastname")}
            disabled={isSubmitting || isUserLoading}
          />
          {formik.touched.lastname && formik.errors.lastname && (
            <div className="fv-plugins-message-container">
              <span role="alert" className="fv-help-block">{formik.errors.lastname}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">ອີເມວ</label>
          <input
            type="email"
            {...formik.getFieldProps("email")}
            className={fieldClass("email")}
            disabled={isEditMode || isSubmitting || isUserLoading}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="fv-plugins-message-container">
              <span role="alert" className="fv-help-block">{formik.errors.email}</span>
            </div>
          )}
        </div>

        {/* Password */}
        {!isEditMode && (
          <div className="fv-row mb-7">
            <label className="required fw-bold fs-6 mb-2">ລະຫັດຜ່ານ</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                {...formik.getFieldProps("password")}
                className={clsx("form-control form-control-solid", {
                  "is-invalid": formik.touched.password && formik.errors.password,
                })}
                disabled={isSubmitting || isUserLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-sm position-absolute"
                style={{ right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666" }}
                disabled={isSubmitting || isUserLoading}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="fv-plugins-message-container">
                <span role="alert" className="fv-help-block">{formik.errors.password}</span>
              </div>
            )}
          </div>
        )}

        {/* Phone Number */}
        <div className="fv-row mb-7">
          <label className="fw-bold fs-6 mb-2">ເບີໂທ</label>
          <input
            type="text"
            {...formik.getFieldProps("phone_number")}
            className={fieldClass("phone_number")}
            disabled={isSubmitting || isUserLoading}
          />
        </div>

        {/* Role */}
        <div className="mb-7">
          <label className="required fw-bold fs-6 mb-5">ບົດບາດ</label>
          {(["owner", "employee", "customer"] as User["role"][]).map((r) => (
            <div key={r} className="form-check form-check-custom form-check-solid mb-3">
              <input
                id={`role-${r}`}
                className="form-check-input"
                type="radio"
                value={r}
                checked={formik.values.role === r}
                onChange={() => formik.setFieldValue("role", r)}
                disabled={isSubmitting || isUserLoading}
              />
              <label htmlFor={`role-${r}`} className="form-check-label fw-bold text-gray-800">
                {r === 'owner' ? 'ເຈົ້າຂອງ' : r === 'employee' ? 'ພະນັກງານ' : 'ລູກຄ້າ'}
              </label>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="mb-7">
          <label className="required fw-bold fs-6 mb-5">ສະຖານະ</label>
          {(["Active", "Inactive"] as User["status"][]).map((s) => (
            <div key={s} className="form-check form-check-custom form-check-solid mb-3">
              <input
                id={`status-${s}`}
                className="form-check-input"
                type="radio"
                value={s}
                checked={formik.values.status === s}
                onChange={() => formik.setFieldValue("status", s)}
                disabled={isSubmitting || isUserLoading}
              />
              <label htmlFor={`status-${s}`} className="form-check-label fw-bold text-gray-800">
                {s === 'Active' ? 'ໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
              </label>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="text-end pt-3">
          <button
            type="button"
            className="btn btn-light me-3"
            onClick={() => setItemIdForUpdate(undefined)}
            disabled={isSubmitting}
          >
            ຍົກເລີກ
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || isUserLoading || !formik.isValid}
          >
            {isSubmitting ? (
              <>
                {isUploading ? "ກຳລັງອັບໂຫຼດ..." : "ກະລຸນາລໍຖ້າ..."}
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </>
            ) : isEditMode ? "ບັນທຶກ" : "ສ້າງ"}
          </button>
        </div>
      </form>

      {isSubmitting && <EmployeesListLoading />}
    </>
  );
};

export { UserEditModalForm };
