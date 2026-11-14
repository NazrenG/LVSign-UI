import { useEffect, useState } from "react";
import { GitBranch, Plus } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { templateRepository } from "../../../api/templateRepository";

export function RoutingRuleSetsCard({ templateId, isDraft }) {
  const [ruleSets, setRuleSets] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRuleSets() {
      setLoading(true);
      setError("");

      try {
        const result = await templateRepository.getRoutingRuleSets(templateId);

        if (active) {
          setRuleSets(result);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load routing rule sets.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (templateId) {
      loadRuleSets();
    }

    return () => {
      active = false;
    };
  }, [templateId]);

  async function handleCreate(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || creating || !isDraft) {
      return;
    }

    setCreating(true);
    setError("");

    try {
      const created = await templateRepository.createRoutingRuleSet(
        templateId,
        {
          name: trimmedName,
          isActive: true,
        },
      );

      setRuleSets((current) => [...current, created]);
      setName("");
    } catch (err) {
      setError(err.message || "Failed to create routing rule set.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <GitBranch className="size-5 text-primary" aria-hidden="true" />

        <div>
          <h3 className="font-semibold text-ink">Conditional routing</h3>
          <p className="text-sm text-ink-muted">
            Create rule sets for conditional recipient routing.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">Loading routing rule sets...</p>
      ) : (
        <div className="mb-4 space-y-2">
          {ruleSets.length === 0 ? (
            <p className="rounded-sm border border-dashed border-line p-4 text-sm text-ink-muted">
              No routing rule sets yet.
            </p>
          ) : (
            ruleSets.map((ruleSet) => (
              <div
                key={ruleSet.id}
                className="flex items-center justify-between gap-3 rounded-sm border border-line px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {ruleSet.name}
                  </p>

                  <p className="text-xs text-ink-muted">
                    {ruleSet.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}

      {isDraft && (
        <form onSubmit={handleCreate} className="space-y-3">
          <label
            htmlFor="new-routing-rule-set-name"
            className="block text-sm font-medium text-ink"
          >
            Rule set name
          </label>

          <input
            id="new-routing-rule-set-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={150}
            placeholder="e.g. Amount-based approval"
            className="w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-ink outline-none focus:border-primary"
          />

          <Button
            type="submit"
            icon={Plus}
            disabled={!name.trim() || creating || loading}
          >
            {creating ? "Creating..." : "Create rule set"}
          </Button>
        </form>
      )}
    </Card>
  );
}
