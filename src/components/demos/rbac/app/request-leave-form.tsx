"use client";

import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import {
  LeaveTypeSchema,
  NewLeaveRequestSchema,
  WEEK_END,
  WEEK_START,
  type NewLeaveRequest,
} from "../model/contracts";
import { leaveTypeLabel } from "../model/format";
import { useRequestLeaveMutation, type ApiError } from "../store/api";
import { useViewer } from "../guard";
import { appButtonSkin, ErrorNote } from "./ui";

type FieldErrors = Partial<Record<keyof NewLeaveRequest, string[]>>;

/** Fields sit on a glass-subtle form, so they take the card tint to stay readable. */
const inputClass = "bg-card text-foreground";
const labelClass = "mb-1.5 text-xs text-muted-foreground";

/**
 * The same Zod schema validates here (inline errors, before any network call)
 * and in the fake server (so a bypassed form still can't write bad data).
 */
export function RequestLeaveForm({ onDone }: { onDone: () => void }) {
  const viewer = useViewer();
  const [requestLeave, { isLoading, error }] = useRequestLeaveMutation();
  const [errors, setErrors] = useState<FieldErrors>({});
  const id = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = NewLeaveRequestSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }
    setErrors({});
    try {
      await requestLeave({ employeeId: viewer.personaId, request: parsed.data }).unwrap();
      onDone();
    } catch {
      // Surfaced below via the mutation's `error`.
    }
  }

  function clearError(field: keyof NewLeaveRequest) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  const field = (name: keyof NewLeaveRequest) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    onChange: () => clearError(name),
  });

  const fieldError = (name: keyof NewLeaveRequest) =>
    errors[name] && (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-xs text-danger">
        {errors[name][0]}
      </p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request leave"
      className="glass-subtle space-y-3 rounded-xl p-4"
    >
      <div className="grid gap-3 @lg:grid-cols-3">
        <div>
          <Label htmlFor={`${id}-type`} className={labelClass}>
            Type
          </Label>
          <NativeSelect {...field("type")} defaultValue="annual" className="w-full [&>select]:bg-card">
            {LeaveTypeSchema.options.map((type) => (
              <NativeSelectOption key={type} value={type}>
                {leaveTypeLabel[type]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor={`${id}-from`} className={labelClass}>
            From
          </Label>
          <Input {...field("from")} type="date" min={WEEK_START} max={WEEK_END} className={inputClass} />
          {fieldError("from")}
        </div>
        <div>
          <Label htmlFor={`${id}-to`} className={labelClass}>
            To
          </Label>
          <Input {...field("to")} type="date" min={WEEK_START} max={WEEK_END} className={inputClass} />
          {fieldError("to")}
        </div>
      </div>
      <div>
        <Label htmlFor={`${id}-reason`} className={labelClass}>
          Reason
        </Label>
        <Textarea {...field("reason")} rows={2} className={cn(inputClass, "min-h-14 resize-y")} />
        {fieldError("reason")}
      </div>
      {error && <ErrorNote>{(error as ApiError).message ?? "Request failed"}</ErrorNote>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} className="text-muted-foreground">
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isLoading} className={appButtonSkin.primary}>
          {isLoading ? "Submitting…" : `Submit as ${viewer.persona}`}
        </Button>
      </div>
    </form>
  );
}
