package db

import (
	"Measurely/types"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
)

type tmpProject struct {
	types.Project
	Units []byte `db:"units"`
}

type tmpBlocks struct {
	types.Blocks
	Layout []byte `db:"layout"`
	Labels []byte `db:"labels"`
}

func (db *DB) GetProject(id, userId uuid.UUID) (types.Project, error) {
	query := `
		SELECT p.*,
		CASE WHEN p.user_id = $2 THEN 0 ELSE tr.role END AS user_role
		FROM projects p
		LEFT JOIN team_relation tr ON p.id = tr.project_id AND tr.user_id = $2
		WHERE p.id = $1 AND (p.user_id = $2 OR tr.user_id = $2)
	`

	var project types.Project
	var tmp tmpProject
	err := db.Conn.Get(&tmp, query, id, userId)

	if err != nil {
		return types.Project{}, err
	}

	var units []types.Unit
	if err := json.Unmarshal(tmp.Units, &units); err != nil {
		log.Fatalf("Failed to unmarshal units: %v", err)
		return types.Project{}, err
	}

	project = tmp.Project
	project.Units = units
	return project, err
}

func (db *DB) UpdateProjectImage(id uuid.UUID, image string) error {
	_, err := db.Conn.Exec("UPDATE projects SET image = $1 WHERE id = $2", image, id)
	return err
}

func (db *DB) GetProjectCountByUser(userId uuid.UUID) (int, error) {
	var count int = 0
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM projects WHERE user_id = $1", userId)
	return count, err
}

func (db *DB) GetProjectByApi(key string) (types.Project, error) {
	var project types.Project
	var tmp tmpProject
	err := db.Conn.Get(&tmp, "SELECT * FROM projects WHERE api_key = $1", key)

	if err != nil {
		return types.Project{}, err
	}

	var units []types.Unit
	if err := json.Unmarshal(tmp.Units, &units); err != nil {
		log.Fatalf("Failed to unmarshal units: %v", err)
		return types.Project{}, err
	}

	project = tmp.Project
	project.Units = units

	return project, err
}

func (db *DB) GetProjects(userId uuid.UUID) ([]types.Project, error) {
	var projects []types.Project
	var tmp []tmpProject

	query := `
		SELECT p.*,
		CASE WHEN p.user_id = $1 THEN 0 ELSE tr.role END AS user_role
		FROM projects p
		LEFT JOIN team_relation tr ON p.id = tr.project_id AND tr.user_id = $1
		WHERE p.user_id = $1 OR tr.user_id = $1
	`

	err := db.Conn.Select(&tmp, query, userId)
	if err != nil {
		return nil, err
	}

	var units []types.Unit
	for _, t := range tmp {
		if err := json.Unmarshal(t.Units, &units); err != nil {
			log.Fatalf("Failed to unmarshal units: %v", err)
			return nil, err
		}
		t.Project.Units = units
		projects = append(projects, t.Project)
	}

	return projects, err
}

func (db *DB) GetProjectByName(userId uuid.UUID, name string) (types.Project, error) {
	var project types.Project
	var tmp tmpProject
	err := db.Conn.Get(&tmp, "SELECT * FROM projects WHERE user_id = $1 AND name = $2", userId, name)

	if err != nil {
		return types.Project{}, err
	}

	var units []types.Unit
	if err := json.Unmarshal(tmp.Units, &units); err != nil {
		return types.Project{}, err
	}

	project = tmp.Project
	project.Units = units

	return project, err
}

func (db *DB) CreateProject(project types.Project) (types.Project, error) {
	var newProject types.Project
	var tmp tmpProject

	rows, err := db.Conn.NamedQuery(
		"INSERT INTO projects (user_id, api_key, name, current_plan, max_event_per_month) VALUES (:user_id, :api_key, :name, :current_plan, :max_event_per_month) RETURNING *",
		project,
	)
	if err != nil {
		return types.Project{}, err
	}
	defer rows.Close()
	rows.Next()
	err = rows.StructScan(&tmp)
	if err != nil {
		log.Println(err)
		return types.Project{}, err
	}

	var units []types.Unit
	if err := json.Unmarshal(tmp.Units, &units); err != nil {
		return types.Project{}, err
	}

	newProject = tmp.Project
	newProject.Units = units

	return newProject, err
}

func (db *DB) UpdateProjectPlan(id uuid.UUID, plan, stripeSubscriptionId string, maxEvents int) error {
	_, err := db.Conn.Exec(
		`UPDATE projects
	 			SET current_plan = $1,
					stripe_subscription_id = $2,
					max_event_per_month = $3
					WHERE id = $4`, plan, stripeSubscriptionId, maxEvents, id)
	return err
}

func (db *DB) ResetProjectsMonthlyEventCount(user_id uuid.UUID) error {
	_, err := db.Conn.Exec("UPDATE projects SET monthly_event_count = 0 WHERE user_id = $1", user_id)
	return err
}

func (db *DB) UpdateProjectApiKey(id uuid.UUID, apiKey string) error {
	_, err := db.Conn.Exec("UPDATE projects SET api_key = $1 WHERE id = $2", apiKey, id)
	return err
}

func (db DB) UpdateProjectName(id uuid.UUID, newName string) error {
	_, err := db.Conn.Exec("UPDATE projects SET name = $1 WHERE id = $2", newName, id)
	return err
}

func (db *DB) DeleteProject(id uuid.UUID, userId uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM projects WHERE id = $1 AND user_id = $2", id, userId)
	return err
}

func (db *DB) CreateTeamRelation(relation types.TeamRelation) error {
	_, err := db.Conn.Exec(
		"INSERT INTO team_relation (user_id, project_id, role) VALUES ($1, $2, $3)",
		relation.UserId, relation.ProjectId, relation.Role,
	)
	return err
}

func (db *DB) GetTeamRelation(id, projectId uuid.UUID) (types.TeamRelation, error) {
	var relation types.TeamRelation
	err := db.Conn.Get(&relation, "SELECT * FROM team_relation WHERE user_id = $1 AND project_id = $2", id, projectId)
	return relation, err
}

func (db *DB) DeleteTeamRelation(id, projectId uuid.UUID) error {
	_, err := db.Conn.Exec("DELETE FROM team_relation WHERE user_id = $1 AND project_id = $2", id, projectId)
	return err
}

func (db *DB) GetTeamMembersCount(projectId uuid.UUID) (int, error) {
	var count int
	err := db.Conn.Get(&count, "SELECT COUNT(*) FROM team_relation WHERE project_id = $1", projectId)
	return count, err
}

func (db *DB) UpdateUserRole(id, projectId uuid.UUID, newRole int) error {
	_, err := db.Conn.Exec(
		"UPDATE team_relation SET role = $1 WHERE user_id = $2 AND project_id = $3",
		newRole, id, projectId,
	)
	return err
}

func (db *DB) GetUsersByProjectId(projectId uuid.UUID) ([]types.User, error) {
	query := `
		SELECT u.*,
		CASE WHEN p.user_id = u.id THEN 0 ELSE tr.role END AS user_role
		FROM users u
		LEFT JOIN team_relation tr ON u.id = tr.user_id AND tr.project_id = $1
		LEFT JOIN projects p ON p.id = $1
		WHERE p.user_id = u.id OR tr.project_id = $1
		LIMIT 5
	`

	var users []types.User
	err := db.Conn.Select(&users, query, projectId)
	return users, err
}

func (db *DB) UpdateProjectUnits(projectId uuid.UUID, units []types.Unit) error {
	unitsJSON, err := json.Marshal(units)
	if err != nil {
		return err
	}

	_, err = db.Conn.Exec("UPDATE projects SET units = $1 WHERE id = $2", unitsJSON, projectId)
	return err
}

func (db *DB) GetBlocks(projectId, userId uuid.UUID) (*types.Blocks, error) {
	query := "SELECT * FROM blocks WHERE user_id = $1 AND project_id = $2"

	var blocks types.Blocks
	var layoutJSON, labelsJSON []byte

	row := db.Conn.QueryRowx(query, userId, projectId)
	err := row.Scan(&blocks.TeamRelationId, &blocks.UserId, &blocks.ProjectId, &layoutJSON, &labelsJSON)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(layoutJSON, &blocks.Layout); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(labelsJSON, &blocks.Labels); err != nil {
		return nil, err
	}

	return &blocks, nil
}

func (db *DB) CreateBlocks(blocks types.Blocks) (*types.Blocks, error) {
	query := `
		INSERT INTO blocks (team_relation_id, user_id, project_id, layout, labels)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING team_relation_id, user_id, project_id, layout, labels
	`

	layoutJSON, err := json.Marshal(blocks.Layout)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal layout: %w", err)
	}

	labelsJSON, err := json.Marshal(blocks.Labels)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal labels: %w", err)
	}

	var newBlocks types.Blocks
	var returnedLayoutJSON, returnedLabelsJSON []byte

	err = db.Conn.QueryRowx(query, blocks.TeamRelationId, blocks.UserId, blocks.ProjectId, layoutJSON, labelsJSON).
		Scan(&newBlocks.TeamRelationId, &newBlocks.UserId, &newBlocks.ProjectId, &returnedLayoutJSON, &returnedLabelsJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to insert blocks: %w", err)
	}

	if err := json.Unmarshal(returnedLayoutJSON, &newBlocks.Layout); err != nil {
		return nil, fmt.Errorf("failed to unmarshal returned layout: %w", err)
	}
	if err := json.Unmarshal(returnedLabelsJSON, &newBlocks.Labels); err != nil {
		return nil, fmt.Errorf("failed to unmarshal returned labels: %w", err)
	}

	return &newBlocks, nil
}

func (db *DB) UpdateBlocksLayout(projectId, userId uuid.UUID, newLayout []types.Block, newLabels []types.Label) error {
	query := `
		UPDATE blocks
		SET layout = $1, labels = $2
		WHERE project_id = $3 AND user_id = $4
	`

	layoutJSON, err := json.Marshal(newLayout)
	if err != nil {
		return err
	}

	labelsJSON, err := json.Marshal(newLabels)
	if err != nil {
		return err
	}

	_, err = db.Conn.Exec(query, layoutJSON, labelsJSON, projectId, userId)
	return err
}
