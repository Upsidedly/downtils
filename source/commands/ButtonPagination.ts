import { MessageComponentInteraction, CommandInteraction } from "discord.js";
import { MessageButton } from "discord.js";
import { MessageActionRow } from "discord.js";
import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";
import { Interaction } from "discord.js";
import ms from "ms";

export type ButtonPaginationIconType = "EMOJI" | "LABEL"
export type ButtonPaginationMaxType = "DISABLE" | "ROUNDABOUT"
export type ButtonPaginationInteractionOptions = {
  replied?: [boolean, { shouldFollowUp: boolean }] | false;

  leftIconType?: ButtonPaginationIconType;
  leftIcon?: string;

  rightIconType?: ButtonPaginationIconType;
  rightIcon?: string;

  maxType?: ButtonPaginationMaxType;
  fast?: boolean
};
export type ButtonPaginationMessageOptions = {
  reply?: boolean;

  leftIconType?: ButtonPaginationIconType;
  leftIcon?: string;

  rightIconType?: ButtonPaginationIconType;
  rightIcon?: string;

    maxType?: ButtonPaginationMaxType;
    fast?: boolean
};
export type ButtonPaginationData = {
  content?: string,
  embed: MessageEmbed,
  callback?: (message: Message) => unknown;
} | {
  embed?: MessageEmbed,
  content: string;
  callback?: (message: Message) => unknown;
};
export type ButtonPaginationDataArray = ButtonPaginationData[];
export type RepliableInteraction =
  | CommandInteraction
  | MessageComponentInteraction;

export async function ButtonPagination<
  T extends RepliableInteraction | Message
>(
  entity: T,
  data: ButtonPaginationData[],
  options?: T extends RepliableInteraction
    ? ButtonPaginationInteractionOptions
    : ButtonPaginationMessageOptions
) {
  let page = 0;
  const buttons = [
    new MessageButton()
      .setStyle("PRIMARY")
      .setCustomId(entity.id + "_PREV")
      .setDisabled(options?.maxType === "DISABLE"),
    new MessageButton()
      .setLabel(`1/${data.length}`)
      .setStyle("SECONDARY")
      .setCustomId(entity.id + "_CURRENT")
      .setDisabled(),
    new MessageButton()
      .setStyle("PRIMARY")
      .setCustomId(entity.id + "_NEXT"),
  ];

  if (options?.leftIconType) {
    if (options.leftIconType === "EMOJI") {
      buttons[0].setEmoji(options.leftIcon ?? "⬅");
    } else {
      buttons[0].setLabel(options.leftIcon ?? "←");
    }
  } else {
    buttons[0].setLabel("←");
  }

  if (options?.rightIconType) {
    if (options.rightIconType === "EMOJI") {
      buttons[2].setEmoji(options.rightIcon ?? "➡");
    } else {
      buttons[2].setLabel(options.rightIcon ?? "→");
    }
  }

  let message: Message;

  if (entity instanceof Interaction) {
    const typeset_options = options
      ? (options as ButtonPaginationInteractionOptions)
      : null;
    const config = !typeset_options
      ? {
          replied: false,
        }
      : {
          replied: !typeset_options.replied
            ? false
            : typeset_options.replied[0],
          replyFollowup: !typeset_options.replied
            ? null
            : typeset_options.replied[1].shouldFollowUp,
        };

    if (config.replied) {
      if (config.replyFollowup) {
        message = (await entity.followUp({
          content: data[page].content,
          embeds: data[page].embed ? [data[page].embed!] : [],
          components: [new MessageActionRow().addComponents(buttons)],
        })) as Message;
      } else {
        await entity.editReply({
          content: data[page].content,
          embeds: data[page].embed ? [data[page].embed!] : [],
          components: [new MessageActionRow().addComponents(buttons)],
        });

        message = (await entity.fetchReply()) as Message;
      }
    } else {
      await entity.reply({
        content: data[page].content,
        embeds: data[page].embed ? [data[page].embed!] : [],
        components: [new MessageActionRow().addComponents(buttons)],
      });

      message = (await entity.fetchReply()) as Message;
    }
  } else if (entity instanceof Message) {
    const typeset_options = options
      ? (options as ButtonPaginationMessageOptions)
      : null;
    const config = !typeset_options
      ? {
          reply: true,
        }
      : {
          reply: typeset_options.reply || true,
        };
    if (config.reply) {
      message = await entity.reply({
        content: data[page].content,
        embeds: data[page].embed ? [data[page].embed!] : [],
        components: [new MessageActionRow().addComponents(buttons)],
      });
    } else {
      message = await entity.channel.send({
        content: data[page].content,
        embeds: data[page].embed ? [data[page].embed!] : [],
        components: [new MessageActionRow().addComponents(buttons)],
      });
    }
  }

  const channel = entity.channel!;
  const collector = channel.createMessageComponentCollector({
    time: ms("3m"),
  });

  collector.on("end", async () => {
    const lockedComponents = message.components.map((row) => {
      if (row.components[0].customId === entity.id + "_PREV") {
        return new MessageActionRow().setComponents(
          row.components.map((c) => c.setDisabled())
        );
      }
      return row;
    });
    await message.edit({
      embeds: message.embeds,
      components: lockedComponents,
    });
  });

  collector.on("collect", async (button) => {
    if (!button.isButton()) return;

    if (button.customId.startsWith(entity.id)) {
      const goingRight = button.customId.endsWith("NEXT");

      const maxtype = options?.maxType ?? "ROUNDABOUT";

      if (maxtype === 'ROUNDABOUT') {
        if (goingRight) {
          page++;
        } else {
          page--;
        }

        if (page < 0) page = 0;
        if (page >= data.length) page = 0;

        const updated = buttons.map((v, i) => {
          if (i === 1) {
            return v.setLabel(`${page + 1}/${data.length}`);
          }
          return v;
        });

        await button.update({
          content: data[page].content,
          embeds: data[page].embed ? [data[page].embed!] : [],
          components: [new MessageActionRow().addComponents(buttons)],
        });
      } else {
        page = goingRight ? page + 1 : page - 1;

        const fixedComponents = buttons.map((v, i) => {
          if (i === 0) {
            return v.setDisabled(page === 0);
          } else if (i === 1) {
            return v.setLabel(`${page + 1}/${data.length}`);
          } else {
            return v.setDisabled(page === data.length - 1);
          }
        })

        await button.update({
          content: data[page].content,
          embeds: data[page].embed ? [data[page].embed!] : [],
          components: [new MessageActionRow().addComponents(buttons)],
        });
      }
    }
  });
}
