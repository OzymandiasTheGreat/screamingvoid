#ifndef FSHOSTOBJECT_H
#define FSHOSTOBJECT_H

#include <jsi/jsi.h>

namespace screamingvoid {

using namespace facebook::jsi;

class JSI_EXPORT FSHostObject: public HostObject {
public:
    std::vector<PropNameID> getPropertyNames(Runtime& rt) override;
    Value get(Runtime&, const PropNameID& name) override;
};

} // namespace screamingvoid

#endif /* FSHOSTOBJECT_H */
