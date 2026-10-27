"use client";

import { useId, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { GuardedButton } from "../guard";
import { appButtonSkin, headCellClass, headRowClass, PageHeader, paneClass } from "./ui";

// Fictional people and figures, held in local state: payroll isn't part of the cache story.
const initialPayroll = [
  { id: "e-asha", name: "Asha Rao", title: "Product designer", monthly: 5200 },
  { id: "e-daniel", name: "Daniel Okafor", title: "Frontend engineer", monthly: 5600 },
  { id: "e-mei", name: "Mei Lin", title: "QA engineer", monthly: 4800 },
  { id: "e-tomas", name: "Tomás Ruiz", title: "Backend engineer", monthly: 5500 },
];

const money = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

export function PayrollPage() {
  const [rows, setRows] = useState(initialPayroll);
  const [editing, setEditing] = useState<string | null>(null);

  function save(id: string, monthly: number) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, monthly } : r)));
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Payroll" description="November run · fictional figures, in credits per month" />
      <div className={paneClass}>
        <Table className="min-w-md text-left text-xs">
          <caption className="sr-only">Monthly salaries</caption>
          <TableHeader>
            <TableRow className={headRowClass}>
              <TableHead scope="col" className={headCellClass}>Employee</TableHead>
              <TableHead scope="col" className={cn(headCellClass, "text-right")}>Monthly</TableHead>
              <TableHead scope="col" className={cn(headCellClass, "text-right")}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableHead scope="row" className="h-auto px-3 py-2.5 font-normal">
                  <span className="font-medium text-foreground">{row.name}</span>
                  <span className="block text-[0.68rem] text-subtle-foreground">{row.title}</span>
                </TableHead>
                <TableCell className="px-3 py-2.5 text-right font-mono text-foreground">
                  {editing === row.id ? (
                    <SalaryEditor
                      name={row.name}
                      value={row.monthly}
                      onSave={(v) => save(row.id, v)}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    money.format(row.monthly)
                  )}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right">
                  {editing !== row.id && (
                    <GuardedButton
                      permission="salary:edit"
                      actionName="Edit salary"
                      onClick={() => setEditing(row.id)}
                      aria-label={`Edit salary for ${row.name}`}
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground"
                    >
                      <Pencil aria-hidden />
                      <span aria-hidden>Edit</span>
                    </GuardedButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SalaryEditor({
  name,
  value,
  onSave,
  onCancel,
}: {
  name: string;
  value: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = Number(new FormData(event.currentTarget).get("monthly"));
    if (!Number.isInteger(next) || next <= 0) {
      setError("Enter a whole number above 0");
      return;
    }
    onSave(next);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1.5">
        <Input
          name="monthly"
          type="number"
          inputMode="numeric"
          defaultValue={value}
          aria-label={`Monthly salary for ${name}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          autoFocus
          onKeyDown={(e) => e.key === "Escape" && onCancel()}
          className="h-7 w-24 bg-card text-right font-mono text-xs md:text-xs"
        />
        <Button type="submit" size="sm" className={appButtonSkin.primary}>
          Save
        </Button>
      </div>
      {error && (
        <p id={errorId} className="font-sans text-[0.68rem] text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
