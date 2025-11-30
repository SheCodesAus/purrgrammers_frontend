import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import createBoard from "../api/create-board";
import createTeam from "../api/create-team";
import getTeams from "../api/get-teams";
import "./CreateBoardForm.css";

function CreateBoardForm({ onCancel }) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Fetch user's teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      if (!auth?.token) {
        setTeamsLoading(false);
        return;
      }

      try {
        const userTeams = await getTeams(auth.token);
        setTeams(userTeams);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        // Don't show error to user, just continue without teams
      } finally {
        setTeamsLoading(false);
      }
    }

    fetchTeams();
  }, [auth?.token]);

  const [formState, setFormState] = useState({
    fields: {
      title: "",
      description: "",
      selectedTeam: "", // "" = no selection, "create-new" = create new team, or team ID
      newTeamName: "",
    },
    errors: {
      title: "",
      description: "",
      selectedTeam: "",
      newTeamName: "",
      submit: "",
    },
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      description: "",
      selectedTeam: "",
      newTeamName: "",
    };

    // title validation
    if (!formState.fields.title.trim()) {
      newErrors.title = "Board title is required";
      isValid = false;
    }

    // team validation
    if (!formState.fields.selectedTeam) {
      newErrors.selectedTeam = "Please select a team or create a new one";
      isValid = false;
    }

    // new team name validation (only if creating new team)
    if (formState.fields.selectedTeam === "create-new" && !formState.fields.newTeamName.trim()) {
      newErrors.newTeamName = "Team name is required";
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
        let teamId = formState.fields.selectedTeam;
        
        // Create new team if needed
        if (formState.fields.selectedTeam === "create-new") {
          const newTeam = await createTeam(
            { name: formState.fields.newTeamName.trim() },
            auth.token
          );
          teamId = newTeam.id;
        }

        // Create the board
        const boardData = {
          title: formState.fields.title,
          description: formState.fields.description,
          team_id: parseInt(teamId, 10), // Use team_id for backend
        };

        const response = await createBoard(boardData, auth.token);

        // Reset form on success
        setFormState({
          fields: {
            title: "",
            description: "",
            selectedTeam: "",
            newTeamName: "",
          },
          errors: {
            title: "",
            description: "",
            selectedTeam: "",
            newTeamName: "",
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
        selectedTeam: "",
        newTeamName: "",
      },
      errors: {
        title: "",
        description: "",
        selectedTeam: "",
        newTeamName: "",
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

        <div className="board-form-field">
          <label htmlFor="selectedTeam" className="board-form-label">Assign to Team</label>
          {teamsLoading ? (
            <div className="loading-text">Loading teams...</div>
          ) : (
            <select
              id="selectedTeam"
              className="board-form-input"
              value={formState.fields.selectedTeam}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Select a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
              <option value="create-new">+ Create New Team</option>
            </select>
          )}
          {formState.errors.selectedTeam && (
            <span className="board-form-error">{formState.errors.selectedTeam}</span>
          )}
        </div>

        {formState.fields.selectedTeam === "create-new" && (
          <div className="board-form-field">
            <label htmlFor="newTeamName" className="board-form-label">New Team Name</label>
            <input
              type="text"
              id="newTeamName"
              className="board-form-input"
              value={formState.fields.newTeamName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g., Frontend Team"
            />
            {formState.errors.newTeamName && (
              <span className="board-form-error">{formState.errors.newTeamName}</span>
            )}
          </div>
        )}

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