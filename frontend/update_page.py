import re

filepath = 'frontend/app/(student)/story/[id]/page.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

# Remove the Continue button from the parent because the child has it
parent_btn = """          {/* Continue Button - Shows after dialogue is understood */}
          <div className="pt-12 text-center">
            <button
              onClick={() => setDialogueCompleted(true)}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all"
            >
              Ready to Begin - Start Scenes →
            </button>
          </div>"""

content = content.replace(parent_btn, '')

# Update the prop
content = content.replace('<StoryDialogueIntro storyId={story.id} dialogueLines={getDialogueForStory(story.id)} />', '<StoryDialogueIntro storyId={story.id} dialogueLines={getDialogueForStory(story.id)} onStoryStart={() => setDialogueCompleted(true)} />')

open(filepath, 'w', encoding='utf-8').write(content)
print("Updated page.tsx")
