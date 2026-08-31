import {
  ApplicationCommandOptionType,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const COMMANDS: RESTPostAPIApplicationCommandsJSONBody[] = [
  {
    name: "incident",
    description: "Record an incident and reset the counter to zero",
    options: [
      {
        name: "reason",
        description: "What happened? (optional)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  {
    name: "days",
    description: "Show the current streak of days without incidents",
  },
  {
    name: "stats",
    description: "Show incident statistics and history",
  },
];
