import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

export const laneAssignmentSchema = z
  .object({
    laneId: z.string().min(1),
    laneNumber: z.number().int().min(1),
    category: z.enum(["academia", "club", "seleccionados", "libre"]),
    organizationId: z.string().nullable(),
    swimmerCount: z.number().int().min(0).max(99),
    notes: z.string().max(180)
  })
  .superRefine((value, context) => {
    if (value.category !== "libre" && !value.organizationId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationId"],
        message: "Selecciona una organización para esta categoría."
      });
    }
  });

export const hourAssignmentsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hour: z.string().regex(/^\d{2}:\d{2}$/),
  poolId: z.string().min(1),
  assignments: z.array(laneAssignmentSchema).min(1)
});

export const dashboardFiltersSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  poolId: z.string().optional(),
  category: z.enum(["academia", "club", "seleccionados", "libre", "all"]).optional(),
  organizationId: z.string().optional()
});

export const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "El nombre es obligatorio."),
  type: z.enum(["academia", "club", "seleccionados"]),
  active: z.boolean()
});

export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Correo inválido."),
  name: z.string().min(2, "El nombre es obligatorio."),
  role: z.enum(["staff", "admin"]),
  active: z.boolean(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional()
});

export const poolSettingsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  laneCount: z.number().int().min(1).max(12),
  startHour: z.string().regex(/^\d{2}:\d{2}$/),
  endHour: z.string().regex(/^\d{2}:\d{2}$/)
});
