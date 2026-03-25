import { FC, useState } from "react";
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

type Props = {
  isUserLoading: boolean;
  user?: Partial<User>;  // ✅ แก้ตรงนี้
};

const userSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string(),
  password: Yup.string().when("_id", {
    is: (id: string) => !id,
    then: (schema) =>
      schema.min(6, "Minimum 6 characters").required("Password is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  status: Yup.string().required("Status is required"),
  role: Yup.string().required("Role is required"),
});

const initialValues: Partial<User> = {
  name: "",
  lastname: "",
  email: "",
  phone_number: "",
  password: "",
  status: "Active",
  role: "employee",
};

const UserEditModalForm: FC<Props> = ({ user, isUserLoading }) => {
  const { setItemIdForUpdate } = useListView();
  const { query } = useQueryResponse();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = isNotEmpty(user?._id);

  const invalidateUsers = () =>
    queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`]);

 const createMutation = useMutation(createUser, {
  onSuccess: () => {
    Swal.fire({
      icon: 'success',
      title: '<span style="color: #10b981;">User Created</span>',
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      invalidateUsers()
      setItemIdForUpdate(undefined)
      window.location.reload()  // ← เพิ่มตรงนี้
    })
  },
  onError: (error: any) => {
    Swal.fire({
      icon: 'error',
      title: 'Failed to Create User',
      text: error?.message || 'Something went wrong!',
      confirmButtonText: 'OK',
    })
  },
})

  const updateMutation = useMutation(
    (data: User) => updateUser(data._id, data),
    {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: '<span style="color: #10b981;">User Updated</span>',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
      invalidateUsers()
      setItemIdForUpdate(undefined)
      window.location.reload()  // ← เพิ่มตรงนี้
    })
      },
      onError: () => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update user",
        });
      },
    },
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
        if (isEditMode && user?._id) {
          await updateMutation.mutateAsync({
            ...values,
            _id: user._id,
          } as User);
        } else {
          await createMutation.mutateAsync(values as User);
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
    formik.isSubmitting || createMutation.isLoading || updateMutation.isLoading;

  const fieldClass = (name: keyof User) =>
    clsx("form-control form-control-solid", {
      "is-invalid": formik.touched[name] && formik.errors[name],
    });

  return (
    <>
      <form className="form" onSubmit={formik.handleSubmit} noValidate>
        {/* Name */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">Name</label>
          <input
            type="text"
            {...formik.getFieldProps("name")}
            className={fieldClass("name")}
            disabled={isSubmitting || isUserLoading}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="fv-plugins-message-container">
              <span role="alert" className="fv-help-block">
                {formik.errors.name}
              </span>
            </div>
          )}
        </div>

        {/* Last Name */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">Last Name</label>
          <input
            type="text"
            {...formik.getFieldProps("lastname")}
            className={fieldClass("lastname")}
            disabled={isSubmitting || isUserLoading}
          />
          {formik.touched.lastname && formik.errors.lastname && (
            <div className="fv-plugins-message-container">
              <span role="alert" className="fv-help-block">
                {formik.errors.lastname}
              </span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="fv-row mb-7">
          <label className="required fw-bold fs-6 mb-2">Email</label>
          <input
            type="email"
            {...formik.getFieldProps("email")}
            className={fieldClass("email")}
            disabled={isEditMode || isSubmitting || isUserLoading}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="fv-plugins-message-container">
              <span role="alert" className="fv-help-block">
                {formik.errors.email}
              </span>
            </div>
          )}
        </div>
        {!isEditMode && (
          <div className="fv-row mb-7">
            <label className="required fw-bold fs-6 mb-2">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                {...formik.getFieldProps("password")}
                className={clsx("form-control form-control-solid", {
                  "is-invalid":
                    formik.touched.password && formik.errors.password,
                })}
                disabled={isSubmitting || isUserLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn btn-sm position-absolute"
                style={{
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#666",
                }}
                disabled={isSubmitting || isUserLoading}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="fv-plugins-message-container">
                <span role="alert" className="fv-help-block">
                  {formik.errors.password}
                </span>
              </div>
            )}
          </div>
        )}
        {/* Phone Number */}
        <div className="fv-row mb-7">
          <label className="fw-bold fs-6 mb-2">Phone Number</label>
          <input
            type="text"
            {...formik.getFieldProps("phone_number")}
            className={fieldClass("phone_number")}
            disabled={isSubmitting || isUserLoading}
          />
        </div>

        {/* Role */}
        <div className="mb-7">
          <label className="required fw-bold fs-6 mb-5">Role</label>
          {(["ownner", "employee", "cuttomer"] as User["role"][]).map((r) => (
            <div
              key={r}
              className="form-check form-check-custom form-check-solid mb-3"
            >
              <input
                id={`role-${r}`}
                className="form-check-input"
                type="radio"
                value={r}
                checked={formik.values.role === r}
                onChange={() => formik.setFieldValue("role", r)}
                disabled={isSubmitting || isUserLoading}
              />
              <label
                htmlFor={`role-${r}`}
                className="form-check-label fw-bold text-gray-800"
              >
                {r.toUpperCase()}
              </label>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="mb-7">
          <label className="required fw-bold fs-6 mb-5">Status</label>
          {(["Active", "Inactive", "On Leave"] as User["status"][]).map((s) => (
            <div
              key={s}
              className="form-check form-check-custom form-check-solid mb-3"
            >
              <input
                id={`status-${s}`}
                className="form-check-input"
                type="radio"
                value={s}
                checked={formik.values.status === s}
                onChange={() => formik.setFieldValue("status", s)}
                disabled={isSubmitting || isUserLoading}
              />
              <label
                htmlFor={`status-${s}`}
                className="form-check-label fw-bold text-gray-800"
              >
                {s}
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
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || isUserLoading || !formik.isValid}
          >
            {isSubmitting ? (
              <>
                Please wait...
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </>
            ) : isEditMode ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>

      {isSubmitting && <EmployeesListLoading />}
    </>
  );
};

export { UserEditModalForm };
