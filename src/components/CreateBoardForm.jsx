import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import createBoard from "../api/create-board";
import "./CreateBoardForm.css";

function CreateBoardForm({ onCancel }) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    fields: {
      title: "",
      description: "",
    },
    errors: {
      title: "",
      description: "",
      submit: "",
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
    };

    // title validation
    if (!formState.fields.title.trim()) {
      newErrors.title = "Board title is required";
      isValid = false;
    }

    setFormState((prev) => ({
      ...prev,
      errors: newErrors,
    }));
    return isValid;
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      fields: { ...prev.fields, [id]: value },
      errors: { ...prev.errors, [id]: "" },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const response = await createBoard(
          {
            title: formState.fields.title,
            description: formState.fields.description,
          },
          auth.token
        );

        // Reset form on success
        setFormState({
          fields: {
            title: "",
            description: "",
          },
          errors: {
            title: "",
            description: "",
            submit: "",
          },
        });

        // Navigate directly to the new board
        navigate(`/retro-board/${response.id}`);
      } catch (error) {
        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            submit: error.message || "Failed to create board. Please try again.",
          },
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    // Reset form when canceling
    setFormState({
      fields: {
        title: "",
        description: "",
      },
      errors: {
        title: "",
        description: "",
        submit: "",
      },
    });
    onCancel();
  };

  return (
    <div className="board-form-wrapper">
      <h2 className="board-form-title">Create New Retro Board</h2>
      <div className="board-form">
        <div className="board-form-field">
          <label htmlFor="title" className="board-form-label">Board Title</label>
          <input
            type="text"
            id="title"
            className="board-form-input"
            value={formState.fields.title}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., Sprint 23 Retrospective"
          />
          {formState.errors.title && (
            <span className="board-form-error">{formState.errors.title}</span>
          )}
        </div>

        <div className="board-form-field">
          <label htmlFor="description" className="board-form-label">Description</label>
          <textarea
            id="description"
            className="board-form-textarea"
            value={formState.fields.description}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Optional description of this retrospective session"
            rows={3}
          />
          {formState.errors.description && (
            <span className="board-form-error">{formState.errors.description}</span>
          )}
        </div>

        {formState.errors.submit && (
          <div className="board-form-error">{formState.errors.submit}</div>
        )}

        <div className="board-form-buttons">
          <button type="button" className="board-form-btn board-form-btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Board"}
          </button>

          <button type="button" className="board-form-btn board-form-btn-secondary" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateBoardForm;