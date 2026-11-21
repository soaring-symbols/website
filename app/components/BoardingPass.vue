<template>
  <!-- One ticket: the departure board (the slot) and, past a perforation,
       the stub for the airline picked on it: its logo and the way to its
       page. Its name, codes and country are on the board already -->
  <article class="ticket">
    <div class="ticket-board">
      <slot />
    </div>

    <div class="pass" aria-live="polite">
      <!-- Where the stub tears off -->
      <div class="pass-tear" aria-hidden="true" />

      <div class="pass-body">
        <!-- Set as the board's column headings, on their line; the name,
             on the board already, is only read out as the board turns -->
        <h2 class="pass-label">
          Now boarding<span class="sr-only">: {{ airline.name }}</span>
        </h2>

        <div
          class="pass-logo relative overflow-hidden rounded-lg bg-tile"
          :class="darkTile(airline, 'logo')"
          :style="{ backgroundImage: tint }"
        >
          <MarkImg
            :entry="airline"
            variant="logo"
            :alt="`${airline.name} logo`"
            img-class="absolute inset-0 size-full object-contain p-5"
          />
        </div>

        <UButton
          :to="`/airlines/${airline.slug}`"
          label="View logos and details"
          trailing-icon="solar:arrow-right-linear"
          color="primary"
          variant="solid"
          class="w-full justify-center"
          :ui="{ label: 'block' }"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  airline: { type: Object, required: true },
})

// A faint wash of the airline's own color behind its marks
const tint = computed(() => brandTint(props.airline))
</script>

<style scoped>
/* The board and the stub side by side on a wide screen, one above the
   other on a narrow one, in one card with rounded corners and the board's
   colors in either mode */
.ticket {
  --notch: 0.75rem;
  /* How far into the stub the perforation runs */
  --tear: 1rem;
  display: grid;
  overflow: hidden;
  border-radius: 0.75rem;
  color: var(--color-flap-ink);
  box-shadow: 0 24px 48px -24px rgb(15 23 42 / 0.35);
}

:global(.dark) .ticket {
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 24px 48px -24px rgb(0 0 0 / 0.6);
}

/* The board gives up its own card: the ticket rounds the corners */
.ticket-board :deep(.board) {
  height: 100%;
  border-radius: 0;
  box-shadow: none;
}

/* The stub, with a notch cut at each end of its perforation, so whatever
   lies behind the ticket (the page, the globe) shows through */
.pass {
  position: relative;
  display: flex;
  flex-direction: column;
  /* Over the board by a pixel: where the two meet between pixels, phones
     would show a hairline of the page through the seam */
  margin-top: -1px;
  background: var(--color-board);
  mask:
    radial-gradient(
      circle var(--notch) at 0 var(--tear),
      transparent 96%,
      #000 100%
    ),
    radial-gradient(
      circle var(--notch) at 100% var(--tear),
      transparent 96%,
      #000 100%
    );
  mask-composite: intersect;
}

/* The perforation, just inside the edge the stub shares with the board */
.pass-tear {
  position: absolute;
  top: var(--tear);
  right: 0;
  left: 0;
  border-top: 2px dashed rgb(236 235 228 / 0.22);
}

.pass-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.25rem;
  padding: calc(var(--tear) + 1.25rem) 1.5rem 1.5rem;
}

/* Tailwind's xl: the stub moves beside the board, the perforation to its
   left edge and the notches to the top and bottom */
@media (min-width: 1280px) {
  .ticket {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }

  .pass {
    margin-top: 0;
    margin-left: -1px;
    mask:
      radial-gradient(
        circle var(--notch) at var(--tear) 0,
        transparent 96%,
        #000 100%
      ),
      radial-gradient(
        circle var(--notch) at var(--tear) 100%,
        transparent 96%,
        #000 100%
      );
    mask-composite: intersect;
  }

  .pass-tear {
    top: 0;
    right: auto;
    bottom: 0;
    left: var(--tear);
    border-top: 0;
    border-left: 2px dashed rgb(236 235 228 / 0.22);
  }

  /* Lined up with the board: the label on the line of its column
     headings, the logo as tall as its six rows and the button centred on
     the line of its footer */
  .pass-body {
    gap: 0;
    padding: 0.75rem 1.5rem 0.75rem calc(var(--tear) + 1.5rem);
  }

  /* As tall as the headings with their space below (scoped to the body
     to win over the label's own rule further down) */
  .pass-body .pass-label {
    margin-bottom: 0;
    padding-bottom: 0.5rem;
  }

  /* The footer's space above, less half of how much taller the button is
     than the board's pause button (32px to 28px) */
  .pass-body > :last-child {
    margin-top: calc(0.75rem - 2px);
  }
}

/* The logo across the stub: as tall as the board leaves it beside the
   board, a 2:1 tile of at most 10rem under it. The image is laid over
   the tile, so its own size never makes the ticket taller. Its width is
   set rather than stretched: Safari carries the max-height through the
   ratio to a max-width of 20rem, which left the tile short of the stub's
   width on a phone wider than that */
.pass-logo {
  width: 100%;
  aspect-ratio: 2 / 1;
  max-height: 10rem;
}

@media (min-width: 1280px) {
  .pass-logo {
    flex: 1;
    min-height: 7rem;
    aspect-ratio: auto;
    max-height: none;
  }
}

/* As the board's column headings */
.pass-label {
  margin-bottom: -0.5rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-signal-500);
}
</style>
