# The archive's tables

Every table in `tables.sqlite`, grouped by what it is about. See
[archive.md](archive.md) for how the extract is built and why it is the
authority.

The extract holds **305 `.tbl` files** but **302 SQLite tables**. `tbl-to-sqlite`
converts only tables it has a `.headers` file for, so three are skipped:
`quest_prologue`, `short_story_startup_keep_fade` and `voice_text` (the last
being the only `.tbl` in a subfolder).

Row counts are from the 2.0.2 extract. Where a table's columns are all `Unk`,
the description says what the data looks like and no more - the column names in
`Headers/` are reverse-engineered and a guess dressed as a fact is worse than an
admitted gap.

## Characters

| Table                          | Rows | Holds                                                                         |
| ------------------------------ | ---- | ----------------------------------------------------------------------------- |
| `chara`                        | 41   | the roster: `CharId`, `CharaName`, `Element`, `Gender`, skill names, model id |
| `chara_status`                 | 589  | base HP/ATK/DEF and flat stun/crit per character per level                    |
| `chara_status_fate`            | 261  | the HP/ATK a fate episode adds; its other three columns do nothing            |
| `chara_exp`                    | 600  | XP required and MSP granted per character level                               |
| `chara_exp_type`               | 6    | XP curve types; all rows currently flat                                       |
| `chara_master_exp`             | 56   | cumulative MSP per master level                                               |
| `chara_costume`                | 41   | costumes: name, blurb, model id, 24 colour slots                              |
| `chara_color`                  | 12   | colour variants and their badge / DLC / story-completion gates                |
| `chara_icon`                   | 51   | per-character icon ids, one per UI context; columns unlabelled                |
| `chara_str`                    | 373  | raw string pool backing character text                                        |
| `chara_gem`                    | 4    | sigil slot rows keyed `GEMSLOT_*`                                             |
| `chara_invite`                 | 17   | crewmate recruitment presets: levels, tree node counts, MSP bonus             |
| `chara_level_sync`             | 59   | level-sync ceilings for every progression axis at once                        |
| `chara_guest_npc_parameter`    | 44   | four stat values per guest NPC id                                             |
| `chara_action_voice`           | 34   | `VT_*` voice-line ids per action slot; slots unlabelled                       |
| `voice_emotion`                | 57   | emote voice sets per character                                                |
| `chara_diff`                   | 22   | enemy-level-minus-player rows: nametag colour and scaling floats              |
| `chara_damage_limit`           | 975  | damage cap by character and attack rate                                       |
| `chara_arts_damage_limit`      | 930  | the same, for arts                                                            |
| `chara_drain_limit`            | 620  | drain cap multipliers by character and attack rate                            |
| `chara_cascade`                | 620  | cascade percent by character and attack rate                                  |
| `chara_weak_point_attack_buff` | 155  | weak-point buff value per character per tier                                  |
| `quest_player_param`           | 29   | one unlabelled value per playable character                                   |
| `formation_slot`               | 22   | party presets: player slot, member slots, guest overrides, slot locks         |
| `ability`                      | 278  | abilities: icon (`cmn_icablt_pl{id}`), element, default slot, sort order      |
| `ability_group`                | 435  | the twelve ability ids a character draws from                                 |

## PWR

| Table                                    | Rows | Holds                                          |
| ---------------------------------------- | ---- | ---------------------------------------------- |
| `chara_power_adjust`                     | 19   | PWR adjustment coefficients                    |
| `chara_power_attenuate`                  | 68   | PWR granted per stat point within a stat range |
| `chara_power_rebuild_adjust`             | 6    | PWR adjustment per transcendence step          |
| `chara_power_skill_adjust`               | 1    | the single trait-side PWR adjustment           |
| `chara_power_skillboard_category_adjust` | 11   | PWR adjustment per skillboard category         |
| `chara_power_skillboard_rank_adjust`     | 3    | PWR adjustment per skillboard rank             |

## Masteries and over-masteries

| Table                             | Rows | Holds                                                                 |
| --------------------------------- | ---- | --------------------------------------------------------------------- |
| `limit_bonus`                     | 1297 | every mastery / over-mastery node: icon, title, description, type     |
| `limit_bonus_param`               | 1123 | per-level values and display format for each node parameter           |
| `limit_bonus_param_type`          | 48   | coefficients per parameter type                                       |
| `limit_bonus_type`                | 9    | coefficients per bonus type                                           |
| `limit_bonus_meditation`          | 3    | over-mastery meditation tiers: how many roll, their weights, MSP cost |
| `limit_bonus_meditation_category` | 45   | per-category meditation weights                                       |
| `limit_bonus_meditation_weight`   | 10   | the weight rows those categories point at (per tier, not per level)   |
| `ap_open_rank`                    | 10   | Masteries rank unlocks: quest and master level required               |
| `ap_tree_atk`                     | 6109 | Masteries Offense nodes: cost, prerequisites, grid position, reqs     |
| `ap_tree_def`                     | 4678 | Masteries Defense nodes, same shape                                   |
| `ap_tree_wep`                     | 960  | Masteries Collection nodes, same shape                                |
| `ap_tree_rebuild`                 | 1920 | Masteries Collection transcendence nodes, same shape                  |

## Skillboard

| Table                            | Rows | Holds                                                           |
| -------------------------------- | ---- | --------------------------------------------------------------- |
| `skillboard_layout`              | 2895 | node placement: category, group, character, effect id           |
| `skillboard_effect`              | 2895 | node effects with their name and description text ids           |
| `skillboard_effect_action_parts` | 2915 | the effect payloads: ten values, status/ability ids, conditions |
| `skillboard_ui`                  | 2895 | the ability icons a node displays                               |
| `skillboard_category`            | 4    | `SB_ATK` / `SB_DEF` and friends                                 |
| `skillboard_group`               | 4    | groups with their node counts                                   |
| `skillboard_auto_acquire`        | 1450 | layout ids granted without being bought                         |
| `skillboard_unlock`              | 50   | per master level: node count, HP, ATK and damage cap added      |

## Weapons

| Table                         | Rows | Holds                                                                         |
| ----------------------------- | ---- | ----------------------------------------------------------------------------- |
| `weapon`                      | 410  | every weapon: name, description, character, traits, uncap/awaken material ids |
| `weapon_status`               | 2602 | ATK/HP/stun/crit per weapon level                                             |
| `weapon_status_awake`         | 580  | stats added per awakening level                                               |
| `weapon_status_rebuild`       | 1120 | stats added per transcendence step                                            |
| `weapon_status_plus`          | 99   | the plus-stat rows                                                            |
| `weapon_status_level_sync`    | 638  | stats under level sync; not present on the base PS4 release                   |
| `weapon_skill_level`          | 35   | trait level by uncap and awakening step                                       |
| `weapon_skill_level_rebuild`  | 3016 | trait level per transcendence step                                            |
| `weapon_exp`                  | 150  | XP and rupie cost per weapon level                                            |
| `weapon_limit`                | 7    | level milestones; its other columns are all zero                              |
| `weapon_color`                | 147  | colour-variant suffixes per weapon                                            |
| `weapon_rebuild_effect`       | 160  | the transcendence visual effect per weapon                                    |
| `weapon_rebuild_effect_color` | 7    | colour sets for those effects                                                 |
| `weapon_pause_top_effect`     | 150  | pause-menu effect ids per weapon                                              |

## Sigils and traits

| Table                  | Rows | Holds                                                            |
| ---------------------- | ---- | ---------------------------------------------------------------- |
| `gem`                  | 1034 | every sigil: name, description, traits, rarity, category, flags  |
| `gem_rare`             | 5    | default and max sigil level per rarity                           |
| `gem_type`             | 5    | the colour palette per sigil type                                |
| `gem_mix`              | 5    | material tier maps for sigil mixing                              |
| `gem_mix_rupi`         | 28   | rupie cost by combined level; removed in 1.3.0                   |
| `gem_mix_ticket`       | 28   | voucher cost by combined level; replaced it in 1.3.0             |
| `gem_mix_success`      | 28   | great / grand success weights; removed in 1.3.0                  |
| `gem_sell`             | 10   | sell price by combined sigil level                               |
| `gem_ticket`           | 10   | voucher value by combined sigil level                            |
| `skill`                | 261  | every trait: `Key`, `Name`, `Summary`, `IconId1`, `IsResistance` |
| `skill_status`         | 6320 | per-trait per-level values - and so the real max level           |
| `skill_lot`            | 439  | weighted trait pools                                             |
| `skill_type_lot`       | 21   | which trait pools roll and at what chance                        |
| `skill_level_lot`      | 20   | trait level roll chances                                         |
| `item_pendulum`        | 74   | wrightstones: main trait, sub-traits, and their level lots       |
| `item_pendulum_sell`   | 3    | wrightstone sell price by trait level                            |
| `item_pendulum_ticket` | 3    | wrightstone voucher cost by trait level                          |

## Summons

| Table                  | Rows | Holds                                                        |
| ---------------------- | ---- | ------------------------------------------------------------ |
| `summon`               | 189  | each summon: its param id, rarity, and four trait lots       |
| `summon_info`          | 77   | name, description, element, cost, control prompts, icon name |
| `summon_param`         | 229  | the effect a summon applies: statuses, values, durations     |
| `summon_param_special` | 3    | overrides pointing at a `summon_param` row                   |
| `summon_base_param`    | 23   | base parameters with per-level values and display multiplier |
| `summon_lot`           | 726  | weighted trait pools with their level curves                 |
| `summon_curve`         | 73   | level weights those lots draw from                           |
| `summon_legend_skill`  | 9    | the legend-tier trait ids                                    |
| `summon_preset`        | 513  | preloaded summon loadouts: traits, base params, slots        |
| `summon_sell`          | 20   | sell value by rarity and total levels                        |
| `summon_constant`      | 1    | one row of summon-wide tuning numbers, unlabelled            |

## Items, materials and shops

| Table                          | Rows | Holds                                                                |
| ------------------------------ | ---- | -------------------------------------------------------------------- |
| `item`                         | 448  | every item: name, description, icon, rarity, sell prices, visibility |
| `item_category`                | 15   | category rows with their stack ceilings                              |
| `item_consume`                 | 5    | consumables: heal percent and cap, revive and team-heal flags        |
| `item_important`               | 36   | key items and the quests that gate them                              |
| `item_tier_map`                | 671  | named bundles of up to fourteen material ids                         |
| `item_material_list`           | 1089 | full crafting recipes: items, counts and coin cost                   |
| `item_material_common_anima`   | 6    | the anima material set per tier                                      |
| `item_material_common_boss`    | 13   | the boss material set per tier                                       |
| `item_material_common_special` | 7    | the special material set per tier                                    |
| `item_material_common_stage`   | 4    | the stage material set per tier                                      |
| `item_junk`                    | 4    | curio types and the rate group each rolls on                         |
| `item_junk_rate_group`         | 32   | weighted entries into the appear-rate table                          |
| `item_junk_appear_rate`        | 4518 | what a curio can yield: item, sigil, wrightstone or rupie range      |
| `item_junk_archive`            | 4    | story-note archive entries a curio can unlock                        |
| `item_quest_detail_disp`       | 18   | how an item is shown on the quest detail screen                      |
| `trade`                        | 551  | shop stock: what is purchasable, stock limits, refresh and featuring |
| `trade_shop`                   | 7    | per-shop weighting of the three purchasable kinds                    |
| `trade_refill`                 | 2    | shop refill rows                                                     |
| `gacha`                        | 4    | draw tiers: sigil vs wrightstone chance, voucher cost, unlock quest  |
| `gacha_rate_group`             | 48   | weighted entries into the draw lots                                  |
| `gacha_lot`                    | 988  | draw contents: item, trait level, quest range, Ragnarok gate         |
| `dlc`                          | 191  | DLC entitlements: item, type, count, colour pack, emote              |
| `dlcpack`                      | 56   | DLC packs and the feature version they need                          |
| `dropcoin_param`               | 6    | dropped-coin values                                                  |

## Rewards and drops

| Table                    | Rows  | Holds                                                                        |
| ------------------------ | ----- | ---------------------------------------------------------------------------- |
| `reward`                 | 6292  | reward definitions: up to six lots plus XP/gold/MSP point lots               |
| `reward_lot`             | 24561 | the drop entries: item, weapon, sigil, weight, difficulty gate               |
| `reward_point`           | 11392 | XP/gold/MSP ranges by rank and difficulty; role set by placement in `reward` |
| `reward_quest_rank`      | 8     | fixed rewards keyed by hashing quest rank into `RW_QUEST_RANK_QR{n}`         |
| `reward_shuffle_lot`     | 10    | silver/gold badge chances, keyed the same way                                |
| `reward_item_rare`       | 24    | quest-type range per item category; drives the box-open sound                |
| `reward_geen_rare`       | 5     | rarity rows the headers flag as likely unused                                |
| `reward_summon`          | 177   | which summon lot a reward rolls and at what chance                           |
| `reward_summon_lot`      | 587   | weighted summon ids                                                          |
| `reward_support`         | 30    | support-item rewards                                                         |
| `reward_support_history` | 2     | two item ids, no other columns                                               |
| `reward_demo`            | 13    | the demo build's fixed rewards                                               |
| `result_box_rate`        | 220   | result-screen box contents: category ranges by quest type and rank           |
| `treasure_chest`         | 102   | chest spawn chances, including the shared-total case                         |
| `chest_reality_lot`      | 5     | three-way weights per key                                                    |
| `town_treasure_reward`   | 377   | town chest rewards; headers mark it possibly unused                          |
| `break_obj`              | 16    | breakable-object rewards, one per reward rank                                |
| `enemy_reward`           | 168   | per-enemy reward ids, selected by quest sub-category                         |
| `enemy_parts`            | 41    | body-part break rewards and the part indices that trigger them               |
| `phase`                  | 43    | per-phase item sets and location text                                        |
| `phase_reward`           | 368   | phase reward placements; mostly stage ids, columns unlabelled                |
| `collectibles_chest`     | 168   | collectible chests and their reward ids                                      |
| `collectibles_ba`        | 45    | collectible ids of the `ba` class                                            |
| `collectibles_crabnew`   | 20    | collectible crab ids                                                         |
| `collectibles_em`        | 25    | collectible enemies, keyed by map                                            |
| `quest_overkill_table`   | 349   | MSP multiplier by overkill damage percent and kill count                     |
| `contribution`           | 4     | contribution thresholds                                                      |

## Enemies

| Table                      | Rows  | Holds                                                             |
| -------------------------- | ----- | ----------------------------------------------------------------- |
| `enemy`                    | 203   | the bestiary: internal names, variant names, statuses, sort order |
| `enemy_level`              | 500   | the level ladder                                                  |
| `enemy_exp`                | 57000 | XP on kill per enemy per level                                    |
| `enemy_status`             | 14698 | Enemy HP/ATK (per level), normal difficulty                       |
| `enemy_status_easy`        | 8780  | Enemy HP/ATK, Easy                                                |
| `enemy_status_hard`        | 8780  | Enemy HP/ATK, Hard                                                |
| `enemy_status_extrem`      | 8780  | Enemy HP/ATK, Extreme                                             |
| `enemy_status_chaos`       | 11383 | Enemy HP/ATK, Chaos                                               |
| `enemy_status_endlessmode` | 10482 | Enemy HP/ATK, endless mode                                        |
| `enemy_link_attack_param`  | 900   | link attack tuning per enemy                                      |
| `quest_boss_param`         | 55    | two tuning values per boss                                        |
| `infinity_param_em7700`    | 20    | duration reduction by attack rate for one specific enemy          |
| `mob`                      | 161   | mob names                                                         |
| `special_combat`           | 35    | PWR bands and the multipliers applied inside them                 |

## Quests and progression

| Table                    | Rows | Holds                                                                      |
| ------------------------ | ---- | -------------------------------------------------------------------------- |
| `quest_baseinfo_ex_data` | 576  | per-quest scoring: PWR by difficulty, time/kill/HP tiers, advised PWR      |
| `quest_difficulty`       | 290  | enemy level and AI level per difficulty, plus scaling floats               |
| `quest_rank`             | 11   | the PWR ceiling for level sync, keyed off the quest id's high bits         |
| `quest_grade_panel`      | 10   | grade panel entries per quest pair                                         |
| `island`                 | 13   | islands: stage name, chapter, town/mission flags                           |
| `location`               | 47   | named locations with their icon and island                                 |
| `stagename`              | 53   | stage names per phase                                                      |
| `chapter_select`         | 45   | the chapter select screen: image, title, description, quest, party slot    |
| `target_task`            | 145  | quest objectives; keys must start `AC_CHA_{questId}_`, type 3=enemy 4=item |
| `evaluation`             | 44   | named evaluation thresholds                                                |
| `badge`                  | 1615 | achievements: name, description, tier, condition, reward, filter class     |
| `badge_note_category`    | 7    | badge categories                                                           |
| `trophy`                 | 96   | platform trophies and their conditions                                     |
| `menu_unlock`            | 63   | which quest or scenario unlocks each menu                                  |
| `infomation_quest`       | 121  | quest ids that raise an information notice                                 |
| `infomation_dialog`      | 20   | the dialog each notice shows                                               |
| `short_story_return`     | 22   | the quest set a short story returns you to                                 |
| `saveinfo`               | 21   | chapter name and title shown on a save slot                                |

## Endless mode

| Table                                 | Rows | Holds                                                         |
| ------------------------------------- | ---- | ------------------------------------------------------------- |
| `endlessmode_difficulty`              | 5    | enemy level range and recommended power per tier              |
| `endlessmode_constant`                | 1    | one row of mode-wide tuning numbers, unlabelled               |
| `endlessmode_buff`                    | 236  | the buffs on offer: name, description, up to eight status ids |
| `endlessmode_buff_category`           | 9    | per-category colour sets                                      |
| `endlessmode_buff_category_lot`       | 9    | category roll weights                                         |
| `endlessmode_buff_rank_lot`           | 44   | buff rank roll weights                                        |
| `endlessmode_buff_increase_effect`    | 42   | how a buff scales as it stacks                                |
| `endlessmode_lot`                     | 1041 | the main weighted roll table                                  |
| `endlessmode_lottype_lot`             | 17   | which lot type is rolled                                      |
| `endlessmode_area_lot`                | 12   | area roll weights                                             |
| `endlessmode_area_portal`             | 10   | portal destinations per area                                  |
| `endlessmode_set_portal`              | 12   | fixed portal sets per difficulty                              |
| `endlessmode_area_score_rank`         | 13   | score thresholds per area rank                                |
| `endlessmode_eventarea_point`         | 371  | event area point values                                       |
| `endlessmode_treasurebox_point`       | 225  | treasure box point values and chances                         |
| `endlessmode_timebonus`               | 48   | time bonus seconds per key                                    |
| `endlessmode_roulette`                | 5    | roulette weights                                              |
| `endlessmode_package`                 | 44   | the offered packages with their name and description text ids |
| `endlessmode_tree`                    | 62   | the progression tree's node links                             |
| `endlessmode_albacore_drop`           | 21   | albacore drop chances and reward ids                          |
| `endlessmode_enemy_adjust`            | 53   | per-enemy stat multipliers                                    |
| `over_critical_rate_endlessmode_buff` | 11   | crit rate granted by the over-crit buff                       |
| `ghost_preset_level_sync`             | 11   | ghost preset stat caps under level sync                       |
| `infinity_rule`                       | 25   | rule sets: up to ten effects, name, description, quest        |
| `infinity_rule_effect`                | 78   | the id/value pairs those rules apply                          |

## Story, fates and notes

| Table                                 | Rows | Holds                                                              |
| ------------------------------------- | ---- | ------------------------------------------------------------------ |
| `story`                               | 324  | story entries: title and body text ids per key                     |
| `fate_episode`                        | 324  | fate episodes: title, summary, character, requirements, party mode |
| `fate_episode_story`                  | 1822 | the scene list per episode, with background and fade               |
| `fate_episode_str`                    | 1067 | raw string pool backing fate text                                  |
| `story_note_archive`                  | 86   | archive notes: title, body, location header, unlocking item        |
| `story_note_archive_category`         | 3    | archive categories                                                 |
| `story_note_chapter`                  | 15   | chapter summaries                                                  |
| `story_note_picturebook_chara`        | 39   | character profiles: age, height, race, hobby, voice actors         |
| `story_note_picturebook_enemy`        | 83   | enemy profiles: name, blurb, boss flag, unlocking quest            |
| `story_note_picturebook_enemy_unlock` | 61   | the unlock conditions for those entries                            |
| `story_note_picturebook_category`     | 5    | picturebook categories                                             |
| `story_note_picturebook_code`         | 4    | code entries with their icons                                      |
| `story_note_tips`                     | 328  | tips: title, body per input device, unlock quest, visibility       |
| `story_note_tips_category`            | 8    | tip categories                                                     |
| `story_note_wordlist`                 | 146  | glossary entries and what reveals them                             |
| `story_note_wordlist_category`        | 7    | glossary categories                                                |
| `bloom_talk`                          | 1594 | town chatter: storyboard id keyed to a progress id                 |
| `bloom_tweet_folka_0`                 | 143  | Folka-board posts by NPC                                           |
| `bloom_tweet_folka_1`                 | 145  | Folka-board posts by party character                               |
| `bloom_tweet_folka_2`                 | 36   | a third Folka-board set                                            |
| `bloom_tweet_grandcypher_0`           | 87   | Grandcypher board posts                                            |
| `bloom_tweet_grandcypher_1`           | 18   | a second Grandcypher set                                           |
| `bloom_tweet_seedhollow`              | 157  | Seedhollow board posts by NPC                                      |
| `bloom_tweet_seedhollow_1`            | 106  | Seedhollow posts by party character                                |
| `bloom_tweet_seedhollow_2`            | 36   | a third Seedhollow set                                             |
| `bubble_talk_progress`                | 10   | the quest that advances each speech-bubble progress id             |
| `bubble_talk_progress_ex`             | 10   | the same for the extra set                                         |
| `telop_chapter`                       | 26   | chapter title cards                                                |
| `telop_location`                      | 35   | location title cards                                               |
| `opening`                             | 29   | opening credits: staff names, positions, durations                 |
| `staffroll`                           | 2821 | the credits roll, ordered and timestamped                          |
| `staffroll_er`                        | 1671 | the ER credits roll                                                |
| `staffroll_lyrics`                    | 74   | timed lyrics over the credits                                      |

## Audio

| Table                      | Rows | Holds                                                            |
| -------------------------- | ---- | ---------------------------------------------------------------- |
| `quest_bgm_event_list`     | 270  | BGM ids; the target of every BGM table below                     |
| `quest_bgm_table`          | 175  | BGM per event slot for a quest; fetched when quest category is 4 |
| `fate_bgm_table`           | 56   | the same for fate episodes; category 3                           |
| `boss_rush_ex_bgm_table`   | 8    | the same for boss rush; category 4 with boss rush set            |
| `speedrun_bgm`             | 11   | speedrun mode tracks                                             |
| `staffroll_bgm`            | 5    | credits tracks with their timings                                |
| `staffroll_er_bgm`         | 3    | ER credits tracks                                                |
| `story_note_bgm`           | 194  | the music player: track name, title, sort order, unlocking quest |
| `facility_voice_list`      | 164  | facility NPC voice lines                                         |
| `facility_voice_condition` | 164  | when each of those lines plays                                   |
| `facility_continue_voice`  | 11   | the continue-prompt voice list per facility                      |

## Interface

| Table                      | Rows | Holds                                                                 |
| -------------------------- | ---- | --------------------------------------------------------------------- |
| `command_list`             | 249  | the move list: up to nineteen inputs with icons, arrows and modifiers |
| `command_list_chara`       | 30   | the per-character move list blurb                                     |
| `command_list_constant`    | 1    | layout offsets for that screen                                        |
| `dialog`                   | 844  | every confirmation dialog: body text and button labels                |
| `status`                   | 168  | buffs and ailments: name, icon, category, level and display flags     |
| `hud_mode`                 | 89   | which HUD elements each mode shows                                    |
| `filter`                   | 40   | filter sets, each pointing at up to eight categories                  |
| `filter_category`          | 54   | a filter's title and its options; `MultiSelect` allows more than one  |
| `filter_sort_list`         | 39   | which filter and sort pair up per screen                              |
| `sort`                     | 26   | sort rows and their options                                           |
| `sort_item`                | 17   | a sort option's label and whether it inverts                          |
| `loading_view`             | 287  | loading screen layouts and whether they need a keypress to dismiss    |
| `loading_lot`              | 745  | which loading view a quest or chapter draws                           |
| `loading_text_random`      | 1436 | the random pool of loading text                                       |
| `loading_text_ref`         | 279  | loading text: title, body per input device, image, format             |
| `gameover_tips`            | 122  | game over tips, optionally scoped to a quest                          |
| `overlay_map`              | 128  | minimap setup per area: centre, rotation, opacity, detail             |
| `tutorial_window`          | 281  | tutorial popups: title, body per input device, image or video         |
| `tutorial_menu`            | 328  | tutorial menu steps and the commands they run                         |
| `tutorial_menu_str`        | 297  | raw string pool for those steps                                       |
| `tutorial_input`           | 29   | expected button presses; the actual prompt lives in the FSM files     |
| `tutorial_popup`           | 9    | small tutorial prompts                                                |
| `photo_mode`               | 27   | photo mode settings with their ranges and defaults                    |
| `photo_mode_filter`        | 14   | the filter list                                                       |
| `photo_mode_frame`         | 33   | frames, their textures and unlock quests                              |
| `photo_mode_submenu`       | 5    | photo mode submenus                                                   |
| `photo_mode_switch_button` | 6    | photo mode toggle labels                                              |

## Options

| Table                        | Rows | Holds                                                             |
| ---------------------------- | ---- | ----------------------------------------------------------------- |
| `option_menu`                | 21   | option menus: title, contents, platform and main-menu visibility  |
| `option_submenu`             | 36   | submenu contents                                                  |
| `option_item`                | 235  | each setting: name, description, min/max, default, platform gates |
| `option_switch_button`       | 79   | toggle labels                                                     |
| `option_slider`              | 11   | slider end labels; the real range comes from `option_item`        |
| `option_window`              | 7    | option window contents                                            |
| `option_submenu_trial`       | 5    | the trial build's submenus                                        |
| `option_switch_button_trial` | 8    | the trial build's toggle labels                                   |
| `option_keyconfig`           | 117  | bindable actions and their labels                                 |
| `option_keycnv`              | 106  | key conversion entries; columns unlabelled                        |
| `option_license`             | 40   | third-party licence text and logos, per platform                  |

## Multiplayer

| Table                                | Rows  | Holds                                                |
| ------------------------------------ | ----- | ---------------------------------------------------- |
| `matching_setting`                   | 3     | matchmaking settings with their name and blurb       |
| `matching_setting_toggle`            | 3     | the two labels each setting toggles between          |
| `matching_strength_value`            | 30    | strength bands used to match players                 |
| `lobby_create_menu_comment_steam`    | 34    | preset lobby comments                                |
| `lobby_create_menu_playstyle_steam`  | 14    | preset playstyle tags                                |
| `communication_fixedphrase`          | 65    | chat phrases with their voice lines                  |
| `communication_autofixedphrase`      | 8     | automatic phrases and their trigger conditions       |
| `communication_charaautofixedphrase` | 232   | the per-character wording of those automatic phrases |
| `communication_emotion`              | 23    | emotes, their animation ids and DLC flags            |
| `communication_stamp`                | 94    | stamps and their unlock conditions                   |
| `communication_shortcut`             | 16    | the default shortcut wheel assignments               |
| `ngwordlist`                         | 10331 | the profanity filter                                 |
| `ngword_whitelist`                   | 142   | terms exempted from it                               |
| `ngword_symbols`                     | 156   | symbols it treats specially                          |
| `ngword_letter_conversion`           | 236   | fullwidth-to-ASCII folding applied before matching   |

## System

| Table                         | Rows | Holds                                                                          |
| ----------------------------- | ---- | ------------------------------------------------------------------------------ |
| `constant`                    | 1    | one row of global tuning: prologue drop thresholds, gem-mix odds, dialog waits |
| `karma_value`                 | 1    | twelve karma tuning values, unlabelled                                         |
| `attack_buff_based_on_damage` | 6    | damage-taken thresholds and the attack buff each grants                        |
